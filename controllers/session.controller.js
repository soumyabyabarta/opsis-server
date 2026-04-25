import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../models/Session.model.js';

/**
 * POST /api/sessions/create
 * Creates an anonymous JWT session
 */
export const createSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const ipHash = Session.hashIP(ip);

    const session = await Session.create({ sessionId, ipHash });

    const token = jwt.sign(
      { sessionId: session.sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      sessionId: session.sessionId,
      expiresIn: '24h',
      message: 'Anonymous session created. No personal data stored.'
    });
  } catch (error) {
    console.error('[Session Create Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};

/**
 * DELETE /api/sessions/delete
 * Deletes all data associated with the current session
 */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.session;

    await Session.deleteOne({ sessionId });

    // Also delete all reports (cascade handled in report controller)
    const { Report } = await import('../models/Report.model.js');
    await Report.deleteMany({ sessionId });

    res.json({
      success: true,
      message: 'All your data has been permanently deleted.'
    });
  } catch (error) {
    console.error('[Session Delete Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
};

/**
 * GET /api/sessions/info
 * Returns session info (report count, session age)
 */
export const getSessionInfo = async (req, res) => {
  try {
    const { sessionId } = req.session;
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const { Report } = await import('../models/Report.model.js');
    const reportCount = await Report.countDocuments({ sessionId });

    const expiresAt = new Date(session.createdAt.getTime() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      sessionId,
      reportCount,
      createdAt: session.createdAt,
      expiresAt,
      dataPolicy: 'All data is automatically deleted 24 hours after session creation.'
    });
  } catch (error) {
    console.error('[Session Info Error]', error);
    res.status(500).json({ success: false, message: 'Failed to get session info' });
  }
};
