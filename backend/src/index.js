require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { mockClubs, mockPlayers, mockNews } = require('./utils/mockData');

// Import routes
const clubRoutes = require('./routes/clubRoutes');
const playerRoutes = require('./routes/playerRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const newsRoutes = require('./routes/newsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const healthRoutes = require('./routes/healthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check
app.use('/api/health', healthRoutes);

// Mock API Routes (for testing without database)
app.get('/api/clubs', (req, res) => {
  res.json(mockClubs);
});

app.get('/api/clubs/:id', (req, res) => {
  const club = mockClubs.find(c => c.id === parseInt(req.params.id));
  res.json(club || { error: 'Club not found' });
});

app.get('/api/players', (req, res) => {
  const { position, club, min_age, max_age } = req.query;
  let filtered = [...mockPlayers];
  
  if (position) filtered = filtered.filter(p => p.position === position);
  if (club) filtered = filtered.filter(p => p.club === club);
  if (min_age) filtered = filtered.filter(p => p.age >= parseInt(min_age));
  if (max_age) filtered = filtered.filter(p => p.age <= parseInt(max_age));
  
  res.json(filtered);
});

app.get('/api/players/:id', (req, res) => {
  const player = mockPlayers.find(p => p.id === parseInt(req.params.id));
  res.json(player || { error: 'Player not found' });
});

app.post('/api/recommendations', (req, res) => {
  const { club_id, limit = 5, positions } = req.body;
  
  let recommendations = [...mockPlayers];
  if (positions && Array.isArray(positions)) {
    recommendations = recommendations.filter(p => positions.includes(p.position));
  }
  
  res.json({
    club_id,
    recommendations: recommendations.slice(0, limit),
    total: recommendations.length
  });
});

app.get('/api/news', (req, res) => {
  const { limit = 10 } = req.query;
  res.json(mockNews.slice(0, parseInt(limit)));
});

// Register new routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Sportify AI server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
