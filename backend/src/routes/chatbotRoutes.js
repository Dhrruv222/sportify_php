const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/ChatbotService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const chatbotService = new ChatbotService();

/**
 * Initialize a chat session
 * POST /api/chat/init
 */
router.post('/init', (req, res) => {
  try {
    const { context } = req.body;
    const sessionId = uuidv4();
    
    chatbotService.initializeSession(sessionId, context);
    
    res.json({
      success: true,
      session_id: sessionId,
      message: 'Chat session initialized',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error(`Session initialization error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send message to chatbot
 * POST /api/chat/message
 */
router.post('/message', async (req, res) => {
  try {
    const { session_id, message, analysis_data } = req.body;
    
    if (!session_id || !message) {
      return res.status(400).json({
        error: 'Session ID and message are required'
      });
    }

    const response = await chatbotService.chat(
      session_id,
      message,
      analysis_data
    );

    res.json(response);
  } catch (error) {
    logger.error(`Chat error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Explain a recommendation
 * POST /api/chat/explain
 */
router.post('/explain', async (req, res) => {
  try {
    const { recommendation, context } = req.body;
    
    if (!recommendation) {
      return res.status(400).json({ error: 'Recommendation is required' });
    }

    const explanation = await chatbotService.explainRecommendation(
      recommendation,
      context
    );

    res.json(explanation);
  } catch (error) {
    logger.error(`Explanation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare recommendations
 * POST /api/chat/compare
 */
router.post('/compare', async (req, res) => {
  try {
    const { recommendations, aspect } = req.body;
    
    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Recommendations array is required' });
    }

    const analysis = await chatbotService.analyzeComparison(
      recommendations,
      aspect
    );

    res.json(analysis);
  } catch (error) {
    logger.error(`Comparison error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Answer contextual questions
 * POST /api/chat/question
 */
router.post('/question', async (req, res) => {
  try {
    const { question, context, session_id } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await chatbotService.answerQuestion(
      question,
      context,
      session_id
    );

    res.json(answer);
  } catch (error) {
    logger.error(`Question answering error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate summary
 * POST /api/chat/summary
 */
router.post('/summary', async (req, res) => {
  try {
    const { analysis_data, summary_type } = req.body;
    
    if (!analysis_data) {
      return res.status(400).json({ error: 'Analysis data is required' });
    }

    const summary = await chatbotService.generateSummary(
      analysis_data,
      summary_type || 'executive'
    );

    res.json(summary);
  } catch (error) {
    logger.error(`Summary generation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get chat history
 * GET /api/chat/history/:sessionId
 */
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = chatbotService.getHistory(sessionId);
    
    if (!history) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(history);
  } catch (error) {
    logger.error(`History retrieval error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * End chat session
 * POST /api/chat/end
 */
router.post('/end', async (req, res) => {
  try {
    const { session_id, analysis_data } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const summary = await chatbotService.endSession(
      session_id,
      analysis_data
    );

    res.json({
      success: true,
      summary: summary,
      message: 'Session ended successfully'
    });
  } catch (error) {
    logger.error(`Session ending error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
