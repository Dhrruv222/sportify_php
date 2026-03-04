const prisma = require('../../config/db');

const savePlayer = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { playerId } = req.params;

        //Create record
        await prisma.savedPlayer.create({
            data: {
                userId,
                playerId
            }
        });

        res.status(201).json({ status: "success", message: "Player added to your Shortlist" });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "The player is already on your list" });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

const removeSavedPlayer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { playerId } = req.params;

        await prisma.savedPlayer.delete({
            where: {
                userId_playerId: { userId, playerId }
            }
        });

        res.status(200).json({ status: "success", message: "Player removed from your Shortlist" });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ message: "The player was not saved" });
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getShortlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const shortlist = await prisma.savedPlayer.findMany({
            where: { userId },
            include: {
                player: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                        user: {
                            select: { profilePhoto: true } 
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const data = shortlist.map(item => item.player);

        res.status(200).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = { savePlayer, removeSavedPlayer, getShortlist };