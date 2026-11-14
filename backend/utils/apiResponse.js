const env = require('../config/env');

/**
 * Standardized API Response Helpers
 */

/**
 * Sends a standardized success JSON response
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message='Operation successful']
 * @param {number} [statusCode=200]
 * @param {object} [meta=null]
 */
const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  const responsePayload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    responsePayload.meta = meta;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * Sends a standardized paginated JSON response
 */
const paginatedResponse = (res, data, total, page, limit, statusCode = 200) => {
  const safeLimit = Math.max(1, limit || 20);
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const count = Array.isArray(data) ? data.length : 0;
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit: safeLimit,
      totalPages,
      hasMore: page < totalPages,
      count,
    },
    count,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  });
};

/**
 * Sends a standardized error JSON response { success: false, message, code, error: { code, message } }
 */
const errorResponse = (res, message = 'An unexpected error occurred', statusCode = 500, code = null, details = null) => {
  const defaultCode =
    code ||
    (statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 400
      ? 'BAD_REQUEST'
      : statusCode === 401
      ? 'UNAUTHORIZED'
      : statusCode === 403
      ? 'FORBIDDEN'
      : statusCode === 409
      ? 'DUPLICATE_ENTRY'
      : statusCode === 429
      ? 'TOO_MANY_REQUESTS'
      : 'INTERNAL_ERROR');

  const isProduction = env.isProduction;
  const clientMessage = isProduction && statusCode === 500 ? 'An internal server error occurred.' : message;

  const responsePayload = {
    success: false,
    message: clientMessage,
    code: defaultCode,
    error: {
      code: defaultCode,
      message: clientMessage,
      ...(details ? { details } : {}),
    },
  };

  if (!isProduction && details) {
    responsePayload.details = details;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
