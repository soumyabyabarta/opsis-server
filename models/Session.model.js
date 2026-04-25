import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Hashed IP for privacy — never store raw IP
  ipHash: {
    type: String,
    required: true,
    select: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // TTL index — auto-delete sessions after 24 hours of inactivity
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  }
});

// Hash IP before saving
sessionSchema.statics.hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');
};

export const Session = mongoose.model('Session', sessionSchema);
