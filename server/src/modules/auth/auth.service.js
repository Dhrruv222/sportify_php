const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { prisma } = require('../../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const register = async (userData) => {
    const { email, password, role, gdprConsent } = userData;

  //Checks existing User
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
    throw new Error("Email already in use");
    }

  //Encryps password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  //Creates new user
    const newUser = await prisma.user.create({
    data: {
        email,
        password: hashedPassword,
        role: role || 'FAN',
        gdprConsent
    },
    select: { id: true, email: true, role: true }
    });

  //Creates tokens
    const accessToken = jwt.sign(
    { userId: newUser.id, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
    { userId: newUser.id },
    REFRESH_SECRET,
    { expiresIn: '30d' }
    );

    return {
    user: newUser,
    accessToken,
    refreshToken
    };
};

const login = async (credentials) => {
    const { email, password } = credentials;

  //Search user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
    throw new Error("Invalid Credentials");
    }

  //Checks password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
    }

  // 3. Generar tokens según roadmap: access (15m) + refresh (30d)
    const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: '30d' }
    );

    return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken
    };
};

module.exports = { register, login };