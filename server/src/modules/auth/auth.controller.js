const authService = require("./auth.service");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/db");

const registerUser = async (req, res) => {
    try {
    const result = await authService.register(req.body);

    // Cookie HttpOnly for the refresh token
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        status: "success",
        data: {
        user: result.user,
        accessToken: result.accessToken,
    },
    });
} catch (error) {
    res.status(400).json({ status: "error", message: error.message });
}
};

const loginUser = async (req, res) => {
    try {
    const result = await authService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        status: "success",
        data: {
        user: result.user,
        accessToken: result.accessToken,
    },
    });
} catch (error) {
    res.status(401).json({ status: "error", message: error.message });
}
};

const googleOAuthCallback = async (req, res) => {
    try {
    const user = req.user;

    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "30d" },
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    // Since Google Login usually happens in the browser,
    //ideally, redirect to the frontend with the token (Dev 2 will receive it)
    //For now, we'll return a JSON so can be test it.
    res.status(200).json({
        status: "success",
        message: "Successful Google Login",
        data: {
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
    },
    });
} catch (error) {
    console.error(error);
    res
        .status(500)
        .json({ status: "error", message: "Authentication error with Google" });
}
};

const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
    return res.status(401).json({ message: "There is no refresh token" });
    try {
    
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) return res.status(401).json({ message: "User does not exist" });

    const newAccessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
    );

    res.status(200).json({
        status: "success",
        data: { accessToken: newAccessToken },
    });
} catch (error) {
    console.error(error);
    res.status(403).json({ message: "Session expired, please log in again" });
}
};

const logout = (req, res) => {
    res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
    });
    
    res.status(200).json({
        status: "success",
        message: "Sesión cerrada exitosamente"
    });
};

module.exports = { registerUser, loginUser, googleOAuthCallback, refreshToken, logout };
