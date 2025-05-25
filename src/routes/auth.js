const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

const router = express.Router();

// LinkedIn OAuth Strategy Configuration
passport.use(new (require('passport-linkedin-oauth2').Strategy)({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL,
  scope: ['openid', 'profile', 'email'],
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('LinkedIn profile data:', JSON.stringify(profile, null, 2));

    // Find or create user
    let user = await User.findOne({ linkedinId: profile.id });
    
    if (!user) {
      // Handle new OAuth 2.0 profile structure
      const email = profile.email; // Email is directly on the profile object
      if (!email) {
        console.error('No email found in profile:', profile);
        return done(new Error('No email found in LinkedIn profile'));
      }

      // Check if user exists with this email
      user = await User.findOne({ email });
      if (user) {
        // Update existing user with LinkedIn ID
        user.linkedinId = profile.id;
        user.firstName = profile.givenName || user.firstName;
        user.lastName = profile.familyName || user.lastName;
        user.profilePicture = profile.picture || user.profilePicture;
        user.headline = profile._json?.headline || user.headline;
      } else {
        // Create new user
        user = new User({
          linkedinId: profile.id,
          email: email,
          firstName: profile.givenName || 'User',
          lastName: profile.familyName || '',
          profilePicture: profile.picture || null,
          headline: profile._json?.headline || ''
        });
      }
      await user.save();
    } else {
      // Update last login and profile data
      user.lastLogin = new Date();
      user.firstName = profile.givenName || user.firstName;
      user.lastName = profile.familyName || user.lastName;
      user.profilePicture = profile.picture || user.profilePicture;
      user.headline = profile._json?.headline || user.headline;
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    return done(error);
  }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// LinkedIn OAuth login route
router.get('/linkedin',
  passport.authenticate('linkedin', { state: true })
);

// LinkedIn OAuth callback route
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
);

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Clear the cookie
    res.clearCookie('connect.sid');
    
    // Send success response
    res.json({ message: 'Logged out successfully' });
  });
});

// Get all users for chat
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all users except the current user
    const users = await User.find({ _id: { $ne: currentUser._id } })
      .select('firstName lastName email profilePicture headline')
      .sort({ firstName: 1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 