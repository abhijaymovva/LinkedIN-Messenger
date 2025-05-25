const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  linkedinId: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Make password optional by default
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  headline: {
    type: String
  },
  isInvited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save middleware to handle password validation
userSchema.pre('save', function(next) {
  // If this is a LinkedIn user, ensure password is not required
  if (this.linkedinId) {
    this.password = undefined;
  }
  next();
});

// Create indexes for efficient querying
userSchema.index({ linkedinId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema); 