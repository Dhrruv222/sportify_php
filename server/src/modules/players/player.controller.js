const prisma = require('../../config/db');

const searchPlayers = async(req,res) =>{
    try{
        const {position,location,name,dominantFoot,height,weight,cursor,limit=10} = req.query;
        
        const whereClause = {};
        
        if(location){
            whereClause.location={
                contains: location,
                mode: 'insensitive'
            };
        }

        if(position){
            whereClause.position = {
                contains: position,
                mode: 'insensitive'
            };
        }

        if(name){
            whereClause.OR = [
                {firstName: {contains: name , mode:'insensitive'}},
                {lastName: {contains: name, mode: 'insensitive'}}
            ];
        }

        if(dominantFoot){
            whereClause.dominantFoot = {
                contains: dominantFoot,
                mode: 'insensitive'
            };
        }

        if(height){
            whereClause.height = {
                gte: parseInt(height)
            };
        }

        if(weight){
            whereClause.weight = {
                lte: parseInt(weight)
            };
        }

        const queryOptions = {
            where: whereClause, //Fiters
            take: parseInt(limit),
            orderBy: { id: 'asc' },
            include: {
                user: { select: { profilePhoto: true } }
            }
        };

        if (cursor) {
            queryOptions.cursor = { id: cursor };
            queryOptions.skip = 1;
        }

        const players = await prisma.player.findMany(queryOptions);

        const nextCursor = players.length === parseInt(limit) ? players[players.length - 1].id : null;

        res.status(200).json({
            status: "success",
            data: players,
            nextCursor
        });
    
    } catch (error) {
        console.error("Error in searchPlayers:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

module.exports = {
    searchPlayers
};