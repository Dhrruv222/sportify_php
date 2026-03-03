const prisma = require("../../config/db");

//Function to get Roles

const getModelByRole = (role) => {
    const models = {
        'PLAYER': prisma.player,
        'CLUB': prisma.club,
        'AGENT': prisma.agent,
        'SCOUT': prisma.scout,
        'COACH': prisma.coach,
        'FAN': prisma.fan,
        'COMPANY': prisma.company
    };
    return models[role];
};

//Get profile based in role
const getProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const profileModel = getModelByRole(role);

        if (!profileModel) {
            return res.status(400).json({ status: "error", message: "Invalid or unsupported role." });
        }

        const profile = await profileModel.findUnique({
            where: { userId }
        });

        res.status(200).json({ 
            status: "success", 
            data: profile || {}
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const profileData = req.body;
        
        const profileModel = getModelByRole(role);

        if (!profileModel) {
            return res.status(400).json({ status: "error", message: "Rol inválido o no soportado." });
        }

        // Upsert: Create if it doesn't exist, update if it does
        const updatedProfile = await profileModel.upsert({
            where: { userId },
            update: profileData,
            create: { userId, ...profileData }
        });

        res.status(200).json({ 
            status: "success", 
            message: `${role} profile updated successfully`,
            data: updatedProfile 
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile
}