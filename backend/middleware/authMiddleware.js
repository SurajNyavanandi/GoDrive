const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');
const env = require('../config/env');

/**
 * Protect routes - verifies Bearer JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || env.JWT_SECRET || 'your_jwt_secret'
    );

    const adminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isConfiguredAdmin = decoded.email && adminEmail && decoded.email.toLowerCase().trim() === adminEmail;

    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      req.user = {
        _id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || 'user@example.com',
        role: isConfiguredAdmin ? 'admin' : (decoded.role || 'user'),
      };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return errorResponse(res, 'User not found', 401);
    }
    if (isConfiguredAdmin || (req.user.email && req.user.email.toLowerCase().trim() === adminEmail)) {
      req.user.role = 'admin';
    }
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

/**
 * Grant access to specific roles (e.g. 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role '${req.user ? req.user.role : 'none'}' is not authorized`,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
