import express from 'express';
import { analyzeUserSymptoms } from '../controllers/symptom.controller.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/analyze', analysisLimiter, analyzeUserSymptoms);

export default router;
