const newsService = require('./news.service');

async function listNews(req, res) {
  try {
    const result = await newsService.listNews(req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createNews(req, res) {
  try {
    const result = await newsService.createNews(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function getNewsById(req, res) {
  try {
    const result = await newsService.getNewsById(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
}

async function ingestNews(req, res) {
  try {
    const result = await newsService.ingestNews(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

module.exports = {
  listNews,
  createNews,
  getNewsById,
  ingestNews,
};