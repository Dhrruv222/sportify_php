const prisma = require('../../config/db');

//Get user
const getUserAccount = async (req,res)=>{
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                role: true,
                profilePhoto: true,
                coverPhoto: true,
                gdprConsent: true,
                createdAt: true
            }
        });
        if (!user) return res.status(404).json({ message: "User does not exists" });
        res.json({ status: "success", data: user });
    }catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Temporary function to generate S3 URL to upload Avatar (Calls Dev 2 Helper)
const getAvatarUploadUrl = async (req, res) => {
    try {
        // NOTE FOR GABRIEL: Here you call the function that Dev 2 will execute.
        //For now, we'll leave the "stub" (shell) ready for the frontend to work on.
        
        // const { generateS3UploadUrl } = require('../../services/s3.service');
        // const uploadUrlData = await generateS3UploadUrl(req.user.userId, 'avatar');
        
        // Temporal Mock
        const mockS3Url = `https://s3.aws.com/sportify-bucket/temp/${req.user.userId}-avatar.jpg?signature=123`;

        res.json({ 
            status: "success", 
            message: "URL generada. El Frontend debe hacer un PUT a esta URL con el archivo.",
            data: { uploadUrl: mockS3Url }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Update photos for the account
const updateAccountPhotos = async (req, res) => {
    try {
        const { profilePhoto, coverPhoto } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { 
                ...(profilePhoto && { profilePhoto }),
                ...(coverPhoto && { coverPhoto })
            },
            select: { id: true, profilePhoto: true, coverPhoto: true }
        });

        res.json({ status: "success", data: updatedUser });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

//Delete user
const deleteUserAccount = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.userId }
        });

        res.json({ status: "success", message: "Cuenta eliminada permanentemente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = {
    getUserAccount,
    getAvatarUploadUrl,
    updateAccountPhotos,
    deleteUserAccount,
}