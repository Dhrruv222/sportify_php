// src/modules/profiles/profile.routes.js
const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');
const { getProfile,updateProfile, getAvatarUploadUrl,addAchievement, addCareerEntry, updateCareerEntry,deleteCareerEntry,deleteAchievement } = require('./profile.controller');

// Require authentication for all profile routes
router.use(authorize([]));

router.get('/', getProfile);
router.put('/me', updateProfile);

router.post('/me/avatar', authorize(['PLAYER','SCOUT','COMPANY','ADMIN','FAN','COACH']), getAvatarUploadUrl);

router.post('/me/career', authorize(['PLAYER']),addCareerEntry);
router.put('/me/career/:id',authorize(['PLAYER']), updateCareerEntry);
router.delete('/me/career/:id', authorize(['PLAYER']), deleteCareerEntry);

router.post('/me/achivements', authorize(['PLAYER']), addAchievement);
router.delete('/me/achivements/:id',authorize(['PLAYER']), deleteAchievement);



module.exports = router;