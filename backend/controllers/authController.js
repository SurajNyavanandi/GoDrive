const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// In-memory fallback user store when MongoDB is offline
const mockUsers = new Map();

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Please provide name, email, and password', 400);
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    const cleanEmail = email.toLowerCase().trim();
    if (mockUsers.has(cleanEmail)) {
      return errorResponse(res, 'An account with this email already exists', 400);
    }

    const mockUser = {
      _id: `user_mock_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
    };
    mockUsers.set(cleanEmail, { ...mockUser, password });

    const token = jwt.sign(
      { id: mockUser._id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_SECRET || 'jwt_secret_dev_2026',
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

  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 'An account with this email already exists', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

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
    'User registered successfully',
    201
  );
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

  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    const cleanEmail = email.toLowerCase().trim();
    let existing = mockUsers.get(cleanEmail);

    // If not found, create or accept demo user
    if (!existing) {
      existing = {
        _id: `user_mock_${Date.now()}`,
        name: cleanEmail.split('@')[0] || 'Demo User',
        email: cleanEmail,
        password,
        role: 'user',
      };
      mockUsers.set(cleanEmail, existing);
    }

    const token = jwt.sign(
      { id: existing._id, email: existing.email, role: existing.role },
      process.env.JWT_SECRET || 'jwt_secret_dev_2026',
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
