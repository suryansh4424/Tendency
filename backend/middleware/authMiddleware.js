const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a constant user ID for development
const DEV_USER_ID = new mongoose.Types.ObjectId('123456789012345678901234');

const auth = async (req, res, next) => {
  try {
    // Temporary development user
    req.user = {
      _id: DEV_USER_ID,
      isPro: false
    };
    next();
    
    // Comment out authentication logic for now
    /*
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
    */
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;
