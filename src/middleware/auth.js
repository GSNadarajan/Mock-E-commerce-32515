/**
 * Authentication middleware
 */

const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const authConfig = require('../config/auth');

// Configure passport to use local strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        // Check if user is verified
        if (!user.isVerified) {
          return done(null, false, { message: 'Email not verified' });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        // Remove password from user object
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure passport to use JWT strategy for protected routes
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: authConfig.jwtSecret
    },
    async (jwtPayload, done) => {
      try {
        // Find user by ID from JWT payload
        const user = await UserModel.getUserById(jwtPayload.id);
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        // Remove password from user object
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Middleware to check if user is authenticated
const isAuthenticated = passport.authenticate('jwt', { session: false });

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === authConfig.roles.ADMIN) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin role required.' });
};

module.exports = {
  passport,
  isAuthenticated,
  isAdmin
};