const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Protects routes by verifying JWT token from httpOnly cookie
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from httpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.',
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Generate JWT token and set it as httpOnly cookie
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Set token cookie on response
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    expires: new Date(Date. now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction, // Must be true for sameSite: 'none'
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear token cookie (for logout)
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
};

module.exports = {
  protect,
  generateToken,
  setTokenCookie,
  clearTokenCookie,
};
