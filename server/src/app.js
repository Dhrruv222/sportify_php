require('dotenv').config();
require('./config/passport');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');


//Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const profileRoutes = require('./modules/profiles/profile.routes');
const socialRoutes = require('./modules/social/social.routes');
const playerRoutes = require('./modules/players/player.routes')

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/players', playerRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            status: 'ok',
            service: 'sportify-server'
        }
    });
});

module.exports = app;