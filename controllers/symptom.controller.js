import { analyzeSymptoms } from '../utils/gemini.js';

/**
 * POST /api/symptoms/analyze
 * Analyze user-described symptoms using Gemini AI
 */
export const analyzeUserSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please describe your symptoms in more detail (at least 10 characters).'
      });
    }

    if (symptoms.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Symptom description is too long. Please limit to 2000 characters.'
      });
    }

    const analysis = await analyzeSymptoms(symptoms);

    res.json({
      success: true,
      analysis,
      message: 'Symptom analysis completed.'
    });
  } catch (error) {
    console.error('[Symptom Analyze Error]', error);
    res.status(503).json({
      success: false,
      message: 'AI symptom analysis temporarily unavailable. Please try again.'
    });
  }
};
