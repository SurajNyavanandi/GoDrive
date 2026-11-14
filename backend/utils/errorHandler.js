const logger = require('./logger');
const env = require('../config/env');

/**
 * Operational Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to forward errors to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express Error Handling Middleware
 * Returns consistent JSON: { success: false, message, code }
 * In production, never return stack traces or internal error details. Log them server-side only.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log error server-side
  logger.error(`Error processing ${req.method} ${req.originalUrl || req.url}: ${err.message}`, err);

  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongooseServerSelectionError' ||
    (err.message &&
      (err.message.includes('buffering timed out') ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('topology was destroyed') ||
        err.message.includes('client is closed') ||
        err.message.includes('not connected')))
  ) {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable.',
      code: 'SERVICE_UNAVAILABLE',
    });
  }

  if (err.message && err.message.startsWith('CORS Error')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      code: 'CORS_FORBIDDEN',
      error: {
        code: 'CORS_FORBIDDEN',
        message: err.message,
      },
    });
  }

  // Handle Mongoose malformed ObjectId CastError with 400 Bad Request
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for identifier: '${err.value}'`,
      code: 'INVALID_ID',
      field: err.path,
      error: {
        code: 'INVALID_ID',
        message: `Invalid format for identifier: '${err.value}'`,
        field: err.path,
      },
    });
  }

  // Handle Mongoose schema validation error with 400 Bad Request
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    const primaryMsg = messages[0] || 'Database validation failed';
    return res.status(400).json({
      success: false,
      message: primaryMsg,
      code: 'VALIDATION_ERROR',
      details: messages,
      error: {
        code: 'VALIDATION_ERROR',
        message: primaryMsg,
        details: messages,
      },
    });
  }

  const statusCode = Number(err.statusCode || err.status) || (res.statusCode >= 400 ? res.statusCode : 500);
  const code =
    err.code ||
    (statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 400
      ? 'VALIDATION_ERROR'
      : statusCode === 401
      ? 'UNAUTHORIZED'
      : statusCode === 403
      ? 'FORBIDDEN'
      : statusCode === 409
      ? 'DUPLICATE_ENTRY'
      : statusCode === 429
      ? 'TOO_MANY_REQUESTS'
      : 'INTERNAL_SERVER_ERROR');

  const isProduction = env.isProduction;
  const clientMessage = isProduction && statusCode === 500
    ? 'An internal server error occurred.'
    : err.message || 'An unexpected error occurred.';

  const payload = {
    success: false,
    message: clientMessage,
    code,
    error: {
      code,
      message: clientMessage,
      ...(err.field ? { field: err.field } : {}),
    },
  };

  if (err.field) {
    payload.field = err.field;
  }

  if (!isProduction && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  logger.warn(`API Route Not Found: ${req.method} ${req.originalUrl || req.url}`);
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl || req.url}`,
    code: 'NOT_FOUND',
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
