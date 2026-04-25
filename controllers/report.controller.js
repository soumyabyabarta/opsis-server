import { Report } from '../models/Report.model.js';
import { analyzeMedicalReport } from '../utils/gemini.js';

/**
 * POST /api/reports/analyze
 * Accepts extracted text from frontend, runs AI analysis, saves to DB
 */
export const analyzeReport = async (req, res) => {
  try {
    const { sessionId } = req.session;
    const { extractedText, fileName, fileType } = req.body;

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Extracted text is too short. Please upload a valid medical report.'
      });
    }

    // Create report document with processing status
    const report = await Report.create({
      sessionId,
      fileName: fileName || 'Medical Report',
      fileType: fileType || 'pdf',
      extractedText: extractedText.substring(0, 10000), // Limit to 10k chars
      status: 'processing'
    });

    // Run AI analysis
    let analysis;
    try {
      analysis = await analyzeMedicalReport(extractedText);
    } catch (aiError) {
      await Report.findByIdAndUpdate(report._id, {
        status: 'error',
        errorMessage: 'AI analysis failed. Please try again.'
      });
      console.error('[Gemini Error]', aiError);
      return res.status(503).json({
        success: false,
        message: 'AI analysis temporarily unavailable. Please try again in a moment.'
      });
    }

    // Update report with analysis results
    const updatedReport = await Report.findByIdAndUpdate(
      report._id,
      { analysis, status: 'completed' },
      { new: true }
    );

    res.status(201).json({
      success: true,
      report: updatedReport,
      message: 'Medical report analyzed successfully.'
    });
  } catch (error) {
    console.error('[Report Analyze Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze report. Please try again.'
    });
  }
};

/**
 * GET /api/reports
 * Get all reports for the current session
 */
export const getReports = async (req, res) => {
  try {
    const { sessionId } = req.session;
    const reports = await Report.find(
      { sessionId, status: 'completed' },
      { extractedText: 0 } // Exclude large text field
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
      count: reports.length
    });
  } catch (error) {
    console.error('[Get Reports Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

/**
 * GET /api/reports/:id
 * Get a single report by ID
 */
export const getReport = async (req, res) => {
  try {
    const { sessionId } = req.session;
    const report = await Report.findOne({
      _id: req.params.id,
      sessionId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or unauthorized access.'
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('[Get Report Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

/**
 * DELETE /api/reports/:id
 * Delete a specific report
 */
export const deleteReport = async (req, res) => {
  try {
    const { sessionId } = req.session;
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      sessionId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or unauthorized access.'
      });
    }

    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('[Delete Report Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
};
