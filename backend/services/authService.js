const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');
const { normalizeMobile } = require('../utils/formatters');
const { AppError } = require('../utils/errorHandler');
const { HTTP_STATUS } = require('../config/constants');

function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError('Database unavailable. Please try again shortly.', HTTP_STATUS.SERVICE_UNAVAILABLE, 'DATABASE_DISCONNECTED');
  }
}

/**
 * Registers a new user account.
 */
async function registerUser({ name, email, password, phone }) {
  ensureDbConnected();

  const cleanEmail = String(email).toLowerCase().trim();
  const normalizedPhone = phone ? normalizeMobile(phone) : '';

  if (phone && (!normalizedPhone || normalizedPhone.length !== 13)) {
    throw new AppError('Please provide a valid 10-digit Indian mobile number', HTTP_STATUS.BAD_REQUEST, 'INVALID_PHONE');
  }

  const isAdmin = Boolean(cleanEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(cleanEmail));

  // Check uniqueness before create
  const existingEmail = await User.findOne({ email: cleanEmail }).select('_id').lean();
  if (existingEmail) {
    throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT, 'DUPLICATE_EMAIL');
  }

  if (normalizedPhone) {
    const existingPhone = await User.findOne({ phone: normalizedPhone }).select('_id').lean();
    if (existingPhone) {
      throw new AppError('This mobile number is already registered.', HTTP_STATUS.CONFLICT, 'DUPLICATE_PHONE');
    }
  }

  try {
    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password,
      phone: normalizedPhone || undefined,
      role: isAdmin ? 'admin' : 'user',
    });

    const token = user.getSignedJwtToken();
    const refreshToken = user.getSignedRefreshToken();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
      refreshToken,
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.phone) {
        throw new AppError('This mobile number is already registered.', HTTP_STATUS.CONFLICT, 'DUPLICATE_PHONE');
      }
      throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT, 'DUPLICATE_EMAIL');
    }
    throw err;
  }
}

/**
 * Authenticates user credentials and returns tokens.
 */
async function authenticateUser({ email, password }) {
  ensureDbConnected();

  const cleanEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  const token = user.getSignedJwtToken();
  const refreshToken = user.getSignedRefreshToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
    refreshToken,
  };
}

/**
 * Generates a new access token from a valid refresh token.
 */
async function refreshUserToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST, 'NO_REFRESH_TOKEN');
  }

  const secret = env.JWT_SECRET;
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, secret);
  } catch (_err) {
    throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
  }

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid token type', HTTP_STATUS.BAD_REQUEST, 'INVALID_TOKEN_TYPE');
  }

  ensureDbConnected();

  const user = await User.findById(decoded.id).select('-password').lean();
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  }

  const newAccessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: env.JWT_EXPIRE || '7d' }
  );

  return { token: newAccessToken };
}

/**
 * Finds user by ID without password field.
 */
async function getUserById(id) {
  ensureDbConnected();
  return User.findById(id).select('-password').lean();
}

module.exports = {
  registerUser,
  authenticateUser,
  refreshUserToken,
  getUserById,
};
