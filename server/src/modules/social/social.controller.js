const prisma = require('../../config/db');

//Follows
const followUser = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followedId = req.params.id;

        // To not follow yourself
        if (followerId === followedId) {
            return res.status(400).json({ status: "error", message: "You can't follow yourself." });
        }

        //Check if user exists
        const userExists = await prisma.user.findUnique({ where: { id: followedId } });
        if (!userExists) {
            return res.status(404).json({ status: "error", message: "User not found." });
        }

        // Upsert in Follows table
        await prisma.follows.create({
            data: {
                followerId,
                followedId
            }
        });

        res.status(201).json({ status: "success", message: "User followed correctly." });

    } catch (error) {
        // Prisma error handling if you try to insert a duplicate (code P2002)
        if (error.code === 'P2002') {
            return res.status(400).json({ status: "error", message: "You already follow this user." });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followedId = req.params.id;

        // Delete using the unique composite index we just added
        await prisma.follows.delete({
            where: {
                followerId_followedId: {
                    followerId,
                    followedId
                }
            }
        });

        res.status(200).json({ status: "success", message: "You have unfollowed the user." });
    } catch (error) {
        // Si no lo estaba siguiendo, Prisma lanza un error de "Record to delete does not exist"
        if (error.code === 'P2025') {
            return res.status(400).json({ status: "error", message: "You do not follow this user." });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getFollowers = async (req, res) => {
    try {
        const userId = req.user.userId;

        const followers = await prisma.follows.findMany({
            where: { followedId: userId },
            include: {
                follower: {
                    select: { id: true, email: true, role: true, profilePhoto: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map for the frontend
        const data = followers.map(f => f.follower);
        res.status(200).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getFollowing = async (req, res) => {
    try {
        const userId = req.user.userId;

        const following = await prisma.follows.findMany({
            where: { followerId: userId },
            include: {
                followed: {
                    select: { id: true, email: true, role: true, profilePhoto: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Map for the frontend
        const data = following.map(f => f.followed);
        res.status(200).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Feed
const getSocialFeed = async (req,res) => {
    try {
        const userId = req.user.userId;
        //We added 'type'. If the frontend doesn't send it, we default to 'discover'.
        const { cursor, limit = 10, type = 'discover' } = req.query; 

        let feedVideos = [];

        //Shared base
        const baseQuery = {
            take: parseInt(limit),
            include: {
                player: {
                    select: { 
                        firstName: true, 
                        lastName: true, 
                        user: { select: { profilePhoto: true } } 
                    }
                },
                _count: { select: { likes: true, comments: true } }
            }
        };

        if (cursor) {
            baseQuery.cursor = { id: cursor };
            baseQuery.skip = 1;
        }

        //To see only videos of players that you are following or global videos
        if (type === 'following') {
            const following = await prisma.follows.findMany({
                where: { followerId: userId },
                select: { followedId: true }
            });
            const followedUserIds = following.map(f => f.followedId);

            if (followedUserIds.length > 0) {
                const followedPlayers = await prisma.player.findMany({
                    where: { userId: { in: followedUserIds } },
                    select: { id: true }
                });
                const followedPlayerIds = followedPlayers.map(p => p.id);

                if (followedPlayerIds.length > 0) {
                    feedVideos = await prisma.video.findMany({
                        ...baseQuery,
                        where: { playerId: { in: followedPlayerIds } },
                        orderBy: { createdAt: 'desc' }
                    });
                }
            }
            
        } else {
            //Global feed
            feedVideos = await prisma.video.findMany({
                ...baseQuery,
                // 'viewsCount: desc ' to most viewed videos 'createdAt: desc' to newest videos
                orderBy: { viewsCount: 'desc' } 
            });
        }

        const nextCursor = feedVideos.length === parseInt(limit) ? feedVideos[feedVideos.length - 1].id : null;

        res.status(200).json({
            status: "success",
            data: feedVideos,
            nextCursor,
            feedType: type //To change feed
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getSocialFeed
}