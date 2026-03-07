const prisma = require('../../config/db');

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const receiverId = req.params.userId;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ status: "error", message: "The message cannot be empty." });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });

        res.status(201).json({ status: "success", data: message });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Get the full chat
const getThread = async (req, res) => {
    try {
        const myId = req.user.userId;
        const otherUserId = req.params.userId;
        const { cursor, limit = 20 } = req.query;

        const queryOptions = {
            where: {
                OR: [
                    { senderId: myId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: myId }
                ]
            },
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }, 
        };

        if (cursor) {
            queryOptions.cursor = { id: cursor };
            queryOptions.skip = 1;
        }

        const messages = await prisma.message.findMany(queryOptions);

        const nextCursor = messages.length === parseInt(limit) ? messages[messages.length - 1].id : null;

        res.status(200).json({ status: "success", data: messages, nextCursor });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//This function needs to be called when they open de message
const markAsRead = async (req, res) => {
    try {
        const myId = req.user.userId;
        const otherUserId = req.params.userId;

        await prisma.message.updateMany({
            where: {
                receiverId: myId,
                senderId: otherUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.status(200).json({ status: "success", message: "Messages marked as read." });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Inbox
const getConversations = async (req, res) => {
    try {
        const myId = req.user.userId;

        const allMyMessages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: myId }, { receiverId: myId }]
            },
            orderBy: { createdAt: 'desc' },//The new messages first
            include: {
                sender: { select: { id: true, email: true, profilePhoto: true } },
                receiver: { select: { id: true, email: true, profilePhoto: true } }
            }
        });

        const conversationsMap = new Map();

        allMyMessages.forEach(msg => {

            const isMeSender = msg.senderId === myId;
            const otherUser = isMeSender ? msg.receiver : msg.sender;

            // If this is the first time we see this user in the loop (i.e., their most recent message)
            if (!conversationsMap.has(otherUser.id)) {
                conversationsMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: msg.content,
                    createdAt: msg.createdAt,
                    unreadCount: 0
                });
            }

            // Unread messages
            if (!isMeSender && !msg.isRead) {
                conversationsMap.get(otherUser.id).unreadCount += 1;
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.status(200).json({ status: "success", data: conversations });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Notifications
const getGlobalUnreadCount = async (req, res) => {
    try {
        const myId = req.user.userId;

        const count = await prisma.message.count({
            where: {
                receiverId: myId,
                isRead: false
            }
        });

        res.status(200).json({ status: "success", data: { unreadTotal: count } });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    sendMessage,
    getThread,
    markAsRead,
    getConversations,
    getGlobalUnreadCount
};