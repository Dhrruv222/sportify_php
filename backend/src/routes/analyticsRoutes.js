const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/AnalyticsService');
const logger = require('../utils/logger');

const analyticsService = new AnalyticsService();

/**
 * Get player analytics
 * GET /api/analytics/player/:playerId
 */
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const analytics = await analyticsService.getPlayerAnalytics(parseInt(playerId));
    res.json(analytics);
  } catch (error) {
    logger.error(`Player analytics error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get club analytics
 * GET /api/analytics/club/:clubId
 */
router.get('/club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    const analytics = await analyticsService.getClubAnalytics(parseInt(clubId));
    res.json(analytics);
  } catch (error) {
    logger.error(`Club analytics error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get recommendation analytics
 * POST /api/analytics/recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { recommendations } = req.body;
    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Invalid recommendations data' });
    }

    const analytics = await analyticsService.getRecommendationAnalytics(recommendations);
    res.json(analytics);
  } catch (error) {
    logger.error(`Recommendation analytics error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get market trends
 * GET /api/analytics/market-trends
 */
router.get('/market-trends', async (req, res) => {
  try {
    const filters = req.query;
    const trends = await analyticsService.getMarketTrends(filters);
    res.json(trends);
  } catch (error) {
    logger.error(`Market trends error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Compare players
 * POST /api/analytics/compare
 */
router.post('/compare', async (req, res) => {
  try {
    const { player_ids } = req.body;
    if (!player_ids || !Array.isArray(player_ids)) {
      return res.status(400).json({ error: 'Invalid player IDs' });
    }

    const comparison = await analyticsService.comparePlayersDetailed(player_ids);
    res.json(comparison);
  } catch (error) {
    logger.error(`Comparison error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Generate insights
 * POST /api/analytics/insights
 */
router.post('/insights', async (req, res) => {
  try {
    const { data_type, context } = req.body;
    if (!data_type) {
      return res.status(400).json({ error: 'Data type is required' });
    }

    const insights = await analyticsService.generateInsights(data_type, context);
    res.json(insights);
  } catch (error) {
    logger.error(`Insights generation error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
