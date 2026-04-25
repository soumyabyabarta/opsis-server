import express from 'express';
import { analyzeReport, getReports, getReport, deleteReport } from '../controllers/report.controller.js';
import { authenticateSession } from '../middleware/auth.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All report routes require a valid session
router.use(authenticateSession);

router.post('/analyze', analysisLimiter, analyzeReport);
router.get('/', getReports);
router.get('/:id', getReport);
router.delete('/:id', deleteReport);

export default router;
