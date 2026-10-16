const { errorResponse } = require('./apiResponse');

/**
 * Async handler wrapper to forward errors to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
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
    console.log('[Database] Offline fallback active — returning graceful response');
    if (req.method === 'GET') {
      return res.json({
        success: true,
        message: 'Database offline mock response',
        data: req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {},
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable (database offline). Connect a database URI to enable full persistence.',
    });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
