const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPro = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isPro: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isPro: true
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ message: 'Failed to upgrade account' });
  }
});

router.post('/downgrade', auth, async (req, res) => {
  try {
    console.log('Downgrade request received');
    console.log('User:', req.user);
    console.log('Headers:', req.headers);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isPro: false },
      { new: true }
    ).exec();

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    const tokenPayload = { 
      userId: user._id,
      isPro: false
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('New token generated');
    res.json({ 
      token,
      message: 'Successfully downgraded to free plan'
    });
  } catch (error) {
    console.error('Downgrade error:', error);
    res.status(500).json({ 
      message: 'Failed to downgrade account',
      error: error.message 
    });
  }
});

// Add this route to check user status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      userId: user._id,
      isPro: user.isPro,
      tokenIsPro: req.user.isPro
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update name
    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 