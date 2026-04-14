const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');
const { searchPlayers } = require('./player.controller');

router.get('/search', authorize([]), searchPlayers);

module.exports = router;