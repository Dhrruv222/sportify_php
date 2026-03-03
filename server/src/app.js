require('dotenv').config();
require('./config/passport');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

//Auth route
const authRoutes = require('./modules/auth/auth.routes');
const fitpassRoutes = require('./modules/fitpass/fitpass.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fitpass', fitpassRoutes);

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