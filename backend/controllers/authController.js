const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokenPayload = {
      userId: user._id,
      isPro: user.isPro
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Generated token:', token);

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add an endpoint to update premium status
exports.updatePremiumStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPro = req.body.isPro;
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id,
        isPro: user.isPro
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 