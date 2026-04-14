const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_secret",
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //Obtain email from Google
        const email = profile.emails[0].value;

        //Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        //Create new user
        if (!user) {
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          user = await prisma.user.create({
            data: {
              email: email,
              password: hashedPassword,
              role: "FAN",
              gdprConsent: true,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

module.exports = passport;
