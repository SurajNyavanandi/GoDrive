const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const env = require('../config/env');
const logger = require('../utils/logger');

// In-memory fallback user store when MongoDB is offline
const mockUsers = new Map();

function normalizeMobile(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? `+91${digits}` : (digits ? `+91${digits}` : '');
}

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, mobile } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide name, email, and password', 400, 'VALIDATION_ERROR');
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const rawPhone = phone || mobile;
  const normalizedPhone = rawPhone ? normalizeMobile(rawPhone) : '';

  if (rawPhone && (!normalizedPhone || normalizedPhone.length !== 13)) {
    return errorResponse(res, 'Please provide a valid 10-digit Indian mobile number', 400, 'INVALID_PHONE');
  }

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isAdmin = cleanEmail === configuredAdminEmail;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    if (mockUsers.has(cleanEmail)) {
      return errorResponse(res, 'An account with this email already exists.', 409, 'DUPLICATE_EMAIL');
    }
    if (normalizedPhone) {
      for (const u of mockUsers.values()) {
        if (u.phone && normalizeMobile(u.phone) === normalizedPhone) {
          return errorResponse(res, 'This mobile number is already registered.', 409, 'DUPLICATE_PHONE');
        }
      }
    }

    // Always hash password with bcrypt even in mock/sandbox mode
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mockUser = {
      _id: `user_mock_${Date.now()}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: normalizedPhone || null,
      role: isAdmin ? 'admin' : 'user',
      password: hashedPassword,
    };
    mockUsers.set(cleanEmail, mockUser);

    const token = jwt.sign(
      { id: mockUser._id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User registered in sandbox mode: ${cleanEmail}`);

    return successResponse(
      res,
      {
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
        },
        token,
        simulated: true,
      },
      'User registered successfully (sandbox mode)',
      201
    );
  }

  // Database Level Uniqueness Checks with lean projection
  const userWithEmail = await User.findOne({ email: cleanEmail }).select('_id').lean();
  if (userWithEmail) {
    return errorResponse(res, 'An account with this email already exists.', 409, 'DUPLICATE_EMAIL');
  }

  if (normalizedPhone) {
    const userWithPhone = await User.findOne({ phone: normalizedPhone }).select('_id').lean();
    if (userWithPhone) {
      return errorResponse(res, 'This mobile number is already registered.', 409, 'DUPLICATE_PHONE');
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
    logger.info(`User registered successfully: ${cleanEmail}`);

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.phone) {
        return errorResponse(res, 'This mobile number is already registered.', 409, 'DUPLICATE_PHONE');
      }
      return errorResponse(res, 'An account with this email already exists.', 409, 'DUPLICATE_EMAIL');
    }
    throw err;
  }
});

/**
 * Login User
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Please provide email and password', 400, 'VALIDATION_ERROR');
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isAdmin = cleanEmail === configuredAdminEmail;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    const existing = mockUsers.get(cleanEmail);

    if (!existing) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, existing.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { id: existing._id, email: existing.email, role: existing.role },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || env.JWT_EXPIRE || '7d' }
    );

    logger.info(`User logged in (sandbox mode): ${cleanEmail}`);

    return successResponse(
      res,
      {
        user: {
          id: existing._id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
        },
        token,
        simulated: true,
      },
      'User logged in successfully (sandbox mode)',
      200
    );
  }

  // Prevent NoSQL injection by ensuring email is a plain string
  const user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const token = user.getSignedJwtToken();
  logger.info(`User logged in successfully: ${cleanEmail}`);

  return successResponse(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
    'User logged in successfully',
    200
  );
});

/**
 * Get Current Logged-in User
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user retrieved', 200);
});

module.exports = {
  register,
  login,
  getMe,
  mockUsers,
};
