const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect middleware: Verify JWT + attach user to req
const protect = async (req, res, next) => {
  let token;

  // Grab token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No token - access denied' });
  }

  try {
    // Verify + decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user (no pass)
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found - invalid token' });
    }
    
    next(); // Green light
  } catch (err) {
    console.error('Token verify failed:', err.message);
    res.status(401).json({ error: 'Invalid/expired token' });
  }
};

module.exports = { protect };