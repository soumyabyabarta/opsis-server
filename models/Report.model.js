import mongoose from 'mongoose';

const flaggedValueSchema = new mongoose.Schema({
  name: String,
  value: String,
  normalRange: String,
  status: { type: String, enum: ['Low', 'High', 'Borderline', 'Critical'] },
  description: String
});

const medicineSchema = new mongoose.Schema({
  name: String,
  purpose: String,
  dosage: String,
  icon: String
});

const recommendationSchema = new mongoose.Schema({
  text: String,
  priority: { type: String, enum: ['High', 'Medium', 'Low'] },
  icon: String
});

const reportSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    default: 'Medical Report'
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    default: 'pdf'
  },
  extractedText: {
    type: String,
    required: true
  },
  analysis: {
    healthScore: { type: Number, min: 0, max: 100 },
    scoreLabel: String,
    scoreDescription: String,
    summary: String,
    confidence: Number,
    flaggedValues: [flaggedValueSchema],
    normalValues: [{ name: String, value: String }],
    medicines: [medicineSchema],
    recommendations: [recommendationSchema],
    followUp: String,
    disclaimers: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  },
  errorMessage: String,
  // TTL index — MongoDB will auto-delete documents 24 hours after creation
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
});

export const Report = mongoose.model('Report', reportSchema);
