const express = require ('express');
const router = express.Router();
const authorize = require('../../middlewares/roleGuard');
const {
    sendMessage,
    getThread,
    markAsRead,
    getConversations,
    getGlobalUnreadCount
} = require('./messages.controller');

router.use(authorize([]));

//Global endpoints for messages
router.get('/conversations',getConversations);
router.get('/unread-count', getGlobalUnreadCount);

//Endpoint for specifics chats
router.get('/thread/:userId', getThread);
router.post('/send/:userId', sendMessage);
router.put('/read/:userId',markAsRead);

module.exports = router;