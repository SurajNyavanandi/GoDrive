const logger = require('./logger');

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

  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage = isProduction && statusCode === 500
    ? 'An internal server error occurred.'
    : err.message || 'An unexpected error occurred.';

  const payload = {
    success: false,
    message: clientMessage,
    code,
  };

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
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
