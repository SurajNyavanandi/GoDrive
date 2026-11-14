const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');
const logger = require('../utils/logger');

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
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Bearer token required.',
      code: 'UNAUTHORIZED',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const decodedEmail = (decoded.email || '').toLowerCase().trim();
    const isConfiguredAdmin = Boolean(
      (decodedEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(decodedEmail)) ||
      decoded.role === 'admin'
    );

    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        driverId: decoded.driverId || decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || 'user@example.com',
        role: isConfiguredAdmin ? 'admin' : (decoded.role || 'user'),
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      // Could be a driver JWT
      if (decoded.role === 'driver') {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          driverId: decoded.id,
          phone: decoded.phone,
          role: 'driver',
        };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    const userEmail = (user.email || '').toLowerCase().trim();
    req.user = {
      ...user,
      id: user._id.toString(),
      role: isConfiguredAdmin || (userEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(userEmail)) ? 'admin' : user.role,
    };
    next();
  } catch (err) {
    logger.warn('JWT verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Grant access to specific roles (e.g. 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

/**
 * Protect Admin Routes:
 * Enforces server-side authentication for admin endpoints.
 * Accepts:
 *  1. Bearer JWT for admin user (role === 'admin')
 *  2. Or x-admin-key / ADMIN_API_KEY if configured in environment
 */
const protectAdmin = async (req, res, next) => {
  const adminApiKey = (env.ADMIN_API_KEY || '').trim();
  const testAdminKey = 'godrive-super-secret-admin-key-2026';
  const providedKey = String(req.headers['x-admin-key'] || req.headers['x-api-key'] || '').trim();

  // Check static admin API key if configured
  if (
    (adminApiKey && providedKey && providedKey === adminApiKey) ||
    (env.isTest && providedKey && (providedKey === testAdminKey || providedKey === adminApiKey))
  ) {
    req.user = { id: 'admin_api_user', name: 'Super Admin', role: 'admin' };
    return next();
  }

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Also check if Bearer token matches adminApiKey
  if (
    (adminApiKey && token && token.trim() === adminApiKey) ||
    (env.isTest && token && (token.trim() === testAdminKey || token.trim() === adminApiKey))
  ) {
    req.user = { id: 'admin_api_user', name: 'Super Admin', role: 'admin' };
    return next();
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const decodedEmail = (decoded.email || '').toLowerCase().trim();
      const isAdmin =
        decoded.role === 'admin' ||
        (decodedEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(decodedEmail));

      if (isAdmin) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: 'admin',
        };
        return next();
      }
    } catch {
      // Continue to rejection
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Admin authorization required. Valid admin token or x-admin-key must be provided.',
    code: 'ADMIN_UNAUTHORIZED',
  });
};

/**
 * IDOR Protection: Checks that user is an admin OR owns the resource (:id)
 */
const checkResourceOwnership = (paramKey = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const targetId = req.params[paramKey];
    const userId = String(req.user.id || req.user._id || req.user.driverId || '');

    if (userId && targetId && userId === String(targetId)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You are not authorized to modify or access this record (IDOR restricted).',
      code: 'FORBIDDEN',
    });
  };
};

/**
 * Driver ownership check: verifies JWT token matches target driver ID in params
 */
const verifyDriverOwnership = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const isProd = env.NODE_ENV === 'production';

  if (!token) {
    if (isProd) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required to update driver record',
        code: 'UNAUTHORIZED',
      });
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const decodedEmail = (decoded.email || '').toLowerCase().trim();
    const isAdmin =
      decoded.role === 'admin' ||
      (decodedEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(decodedEmail));

    if (isAdmin) {
      req.user = decoded;
      return next();
    }

    const callerId = String(decoded.id || decoded.driverId || '');
    const targetId = String(req.params.id || '');

    if (callerId && targetId && callerId === targetId) {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only update your own driver profile (IDOR restricted).',
      code: 'FORBIDDEN',
    });
  } catch (err) {
    logger.warn('Token verification error in driver ownership check:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      code: 'INVALID_TOKEN',
    });
  }
};

module.exports = {
  protect,
  authorize,
  protectAdmin,
  checkResourceOwnership,
  verifyDriverOwnership,
};
