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


//Achiviments and Career

//Mock of AWS
const getAvatarUploadUrl = async (req, res) => {
    try {
        const { fileType } = req.body;
        const userId = req.user.userId;

        if (!fileType) {
            return res.status(400).json({ status: "error", message: "FileType is required (e.g., image/jpeg)" });
        }

        //Mocking part, connect with aws.ser
        const mockObjectKey = `avatars/${userId}-${Date.now()}`;
        const mockUploadUrl = `https://sportify-mock-s3-bucket.amazonaws.com/${mockObjectKey}?AWSAccessKeyId=MOCK&Signature=MOCK`;

        res.status(200).json({
            status: "success",
            data: {
                url: mockUploadUrl,
                objectKey: mockObjectKey
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const addCareerEntry = async (req,res) => {
    try { 
        const userId = req.user.userId;
        const { teamName, startDate, endDate, role } = req.body;

        const player = await prisma.player.findUnique({ where: { userId } });
        if (!player) return res.status(404).json({ status: "error", message: "User not found." });

        const career = await prisma.careerHistory.create({
            data: {
                playerId: player.id,
                teamName,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                role
            }
        });

        res.status(201).json({ status: "success", data: career });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const updateCareerEntry = async (req, res) => {
    try {
        const careerId = req.params.id;
        const { teamName, startDate, endDate, role } = req.body;

        const updatedCareer = await prisma.careerHistory.update({
            where: { id: careerId },
            data: {
                teamName,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
                role
            }
        });

        res.status(200).json({ status: "success", data: updatedCareer });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


const deleteCareerEntry = async (req, res) => {
    try {
        const careerId = req.params.id;
        await prisma.careerHistory.delete({ where: { id: careerId } });
        res.status(200).json({ status: "success", message: "Entry deleted succesfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const addAchievement = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, date } = req.body; 

        const player = await prisma.player.findUnique({ where: { userId } });
        if (!player) return res.status(404).json({ status: "error", message: "Perfil no encontrado" });

        const achievement = await prisma.achievement.create({
            data: {
                playerId: player.id,
                title,
                description,
                date: new Date(date) 
            }
        });

        res.status(201).json({ status: "success", data: achievement });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const deleteAchievement = async (req, res) => {
    try {
        const achievementId = req.params.id;
        await prisma.achievement.delete({ where: { id: achievementId } });
        res.status(200).json({ status: "success", message: "Achievement removed" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
module.exports = {
    getProfile,
    updateProfile,
    getAvatarUploadUrl,
    addCareerEntry,
    addAchievement,
    updateCareerEntry,
    deleteAchievement,
    deleteCareerEntry
}