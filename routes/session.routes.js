import express from 'express';
import { createSession, deleteSession, getSessionInfo } from '../controllers/session.controller.js';
import { authenticateSession } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', createSession);
router.get('/info', authenticateSession, getSessionInfo);
router.delete('/delete', authenticateSession, deleteSession);

export default router;
