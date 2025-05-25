const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get all users (including current user for testing)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get all users, including the current user
    const users = await User.find()
      .select('-password')
      .sort({ firstName: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Invite a user
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create a new user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user = new User({
      email,
      password: tempPassword,
      firstName: 'New User',
      lastName: '',
      linkedinId: null,
      isInvited: true
    });

    await user.save();

    // TODO: Send email with temporary password and signup link
    // For now, we'll just return the temp password
    res.json({ 
      msg: 'User invited successfully',
      tempPassword // Remove this in production
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 