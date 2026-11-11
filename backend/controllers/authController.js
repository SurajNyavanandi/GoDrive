const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// In-memory fallback user store when MongoDB is offline
const mockUsers = new Map();

/**
 * Register User
 * POST /api/auth/register
 */
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

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, mobile } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide name, email, and password', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const rawPhone = phone || mobile;
  const normalizedPhone = rawPhone ? normalizeMobile(rawPhone) : '';

  if (rawPhone && (!normalizedPhone || normalizedPhone.length !== 13)) {
    return errorResponse(res, 'Please provide a valid 10-digit Indian mobile number', 400);
  }

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isAdmin = cleanEmail === configuredAdminEmail;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    if (mockUsers.has(cleanEmail)) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }
    if (normalizedPhone) {
      for (const u of mockUsers.values()) {
        if (u.phone && normalizeMobile(u.phone) === normalizedPhone) {
          return errorResponse(res, 'This mobile number is already registered.', 409);
        }
      }
    }

    const mockUser = {
      _id: `user_mock_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: normalizedPhone || null,
      role: isAdmin ? 'admin' : 'user',
    };
    mockUsers.set(cleanEmail, { ...mockUser, password });

    const token = jwt.sign(
      { id: mockUser._id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return successResponse(
      res,
      {
        user: mockUser,
        token,
        simulated: true,
      },
      'User registered successfully (sandbox mode)',
      201
    );
  }

  // Database Level Uniqueness Checks
  const userWithEmail = await User.findOne({ email: cleanEmail });
  if (userWithEmail) {
    return errorResponse(res, 'An account with this email already exists.', 409);
  }

  if (normalizedPhone) {
    const userWithPhone = await User.findOne({ phone: normalizedPhone });
    if (userWithPhone) {
      return errorResponse(res, 'This mobile number is already registered.', 409);
    }
  }

  try {
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: normalizedPhone || undefined,
    });

    const token = user.getSignedJwtToken();

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
        return errorResponse(res, 'This mobile number is already registered.', 409);
      }
      return errorResponse(res, 'An account with this email already exists.', 409);
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
    return errorResponse(res, 'Please provide email and password', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isAdmin = cleanEmail === configuredAdminEmail;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    let existing = mockUsers.get(cleanEmail);

    // If not found, create or accept demo user
    if (!existing) {
      existing = {
        _id: `user_mock_${Date.now()}`,
        name: cleanEmail.split('@')[0] || 'Demo User',
        email: cleanEmail,
        password,
        role: isAdmin ? 'admin' : 'user',
      };
      mockUsers.set(cleanEmail, existing);
    } else if (isAdmin) {
      existing.role = 'admin';
    }

    const token = jwt.sign(
      { id: existing._id, email: existing.email, role: existing.role },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: '30d' }
    );

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

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const token = user.getSignedJwtToken();

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
