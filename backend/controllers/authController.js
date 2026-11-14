const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Register User
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  logger.info(`User registered successfully: ${req.body.email}`);
  return successResponse(res, result, 'User registered successfully', HTTP_STATUS.CREATED);
});

/**
 * Login User
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.authenticateUser(req.body);
  logger.info(`User logged in successfully: ${req.body.email}`);
  return successResponse(res, result, 'User logged in successfully', HTTP_STATUS.OK);
});

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.headers['x-refresh-token'];
  const result = await authService.refreshUserToken(token);
  return successResponse(res, result, 'Access token refreshed successfully', HTTP_STATUS.OK);
});

/**
 * Get Current Logged-in User
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user retrieved', HTTP_STATUS.OK);
});

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
};
