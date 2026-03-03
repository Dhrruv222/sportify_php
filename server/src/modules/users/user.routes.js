const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');

const {
    getUserAccount,
    getAvatarUploadUrl,
    updateAccountPhotos,
    deleteUserAccount,
} = require ('./user.controller')

router.use(authorize([]));

router.get('/account', getUserAccount);
router.get('/avatar-url',getAvatarUploadUrl);
router.put('/photos', updateAccountPhotos);
router.delete('/account/delete', deleteUserAccount);

module.exports = router;