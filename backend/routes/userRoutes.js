const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/upgrade', auth, async (req, res) => {
  try {
    console.log('Upgrade request - Current user:', req.user);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set premium status
    user.isPro = true;
    await user.save();
    console.log('User upgraded:', user);

    // Create new token with updated status
    const token = jwt.sign(
      { 
        userId: user._id,
        isPro: true // Explicitly set to true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return new token and user data
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isPro: true
      },
      message: 'Successfully upgraded to premium'
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

module.exports = router; 