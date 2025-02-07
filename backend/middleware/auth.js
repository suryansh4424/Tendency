const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Remove 'Bearer ' prefix if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    try {
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      req.user = {
        _id: decoded.userId,
        isPro: decoded.isPro
      };
      console.log('User set in request:', req.user);
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth; 