const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Strict Rate Limiter for Authentication endpoints (login, register)
 * 10 requests per 15 minutes per IP (disabled in test mode)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

/**
 * Strict Rate Limiter for OTP operations (send, retry, verify)
 * 10 requests per 15 minutes per IP (disabled in test mode)
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please try again after 15 minutes.',
    },
  },
});

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP (disabled in test mode)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
});

module.exports = {
  authLimiter,
  otpLimiter,
  generalLimiter,
};
