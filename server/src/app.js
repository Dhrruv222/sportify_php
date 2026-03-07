require('dotenv').config();
require('./config/passport');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { validateEnv } = require('./config/env');


//Routes
const authRoutes = require('./modules/auth/auth.routes');
const fitpassRoutes = require('./modules/fitpass/fitpass.routes');
const companyRoutes = require('./modules/company/company.routes');
const newsRoutes = require('./modules/news/news.routes');
const userRoutes = require('./modules/users/user.routes');
const profileRoutes = require('./modules/profiles/profile.routes');
const socialRoutes = require('./modules/social/social.routes');
const playerRoutes = require('./modules/players/player.routes');
const messagesRoutes = require('./modules/messages/messages.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fitpass', fitpassRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/messages', messagesRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'ok',
            service: 'sportify-server'
        }
    });
});

app.get('/api/health/ready', (req, res) => {
    const envStatus = validateEnv();
    const checks = {
        database: {
            configured: Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL),
        },
        jwt: {
            configured: Boolean(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET),
        },
        aiService: {
            configured: Boolean(process.env.AI_SERVICE_URL),
        },
        queue: {
            mode: process.env.REDIS_URL ? 'bullmq' : 'inline',
        },
        envValidation: {
            ok: envStatus.ok,
            errors: envStatus.errors,
            warnings: envStatus.warnings,
            nodeEnv: envStatus.nodeEnv,
        },
    };

    const status = envStatus.ok ? 'ready' : 'degraded';
    const responseCode = envStatus.ok || envStatus.nodeEnv !== 'production' ? 200 : 503;

    res.status(responseCode).json({
        success: true,
        data: {
            status,
            service: 'sportify-server',
            checks,
        },
    });
});

module.exports = app;