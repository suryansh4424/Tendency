const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    // Check username first
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check email only if provided
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Create new user
    const user = new User({
      username,
      password,
      name,
      ...(email && { email }) // Only include email if provided
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, isPro: user.isPro },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { username: username },
          { email: username }
        ]
      },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, isPro: user.isPro },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router; 