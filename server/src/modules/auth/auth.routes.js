const passport = require('passport');
const express = require('express');
const { registerUser, loginUser, googleOAuthCallback,refreshToken,logout} = require('./auth.controller');
const authorize = require('../../middlewares/roleGuard');

const router = express.Router();

//Login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

//Google login Routes
router.get('/oauth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/oauth/callback', passport.authenticate('google', { session: false }), googleOAuthCallback);

// Token Management
router.post('/refresh', refreshToken);
router.post('/logout', logout);

//---Tests routes for RBAC----
//Any user (Welcome Page)
router.get('/profile', authorize([]), (req, res) => {
    res.json({ message: "Welcome to your profile", user: req.user });
});

//Admin Route for stats
router.get('/admin/stats', authorize(['ADMIN']), (req, res) => {
    res.json({ message: "Welcome, Administrator. Here are the statistics." });
});

//Player route for upload videos
router.get('/player/upload', authorize(['PLAYER']), (req,res)=>{
    res.json({message: "Upload your videos here"});
})

module.exports = router;