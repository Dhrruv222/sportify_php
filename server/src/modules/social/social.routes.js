const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');
const { followUser, unfollowUser, getFollowers, getFollowing, getSocialFeed } = require('./social.controller');
const {savePlayer,removeSavedPlayer,getShortlist} = require('./shortlist.controller')

router.use(authorize([]));
//Social routes
router.post('/follow/:id', followUser);
router.delete('/unfollow/:id', unfollowUser);
router.get('/followers', getFollowers);
router.get('/following', getFollowing);
//Feed routes
router.get('/feed', authorize([]), getSocialFeed);
//Shortlist
router.post('/shortlist/saved/:playerId', authorize(['SCOUT', 'CLUB', 'COMPANY']), savePlayer);
router.delete('/shortlist/saved/:playerId', authorize(['SCOUT', 'CLUB', 'COMPANY']), removeSavedPlayer);
router.get('/shortlist/saved', authorize(['SCOUT', 'CLUB', 'COMPANY']), getShortlist);

module.exports = router;