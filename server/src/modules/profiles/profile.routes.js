// src/modules/profiles/profile.routes.js
const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');
const { getProfile, updateProfile } = require('./profile.controller');

// Require authentication for all profile routes
router.use(authorize([]));

router.get('/', getProfile);
router.put('/me', updateProfile);

module.exports = router;