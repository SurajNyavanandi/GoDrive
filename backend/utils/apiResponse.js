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
 * Sends a standardized error JSON response { success: false, message, code }
 * In production, never return stack traces or internal error details.
 * @param {import('express').Response} res
 * @param {string} [message='An unexpected error occurred']
 * @param {number} [statusCode=500]
 * @param {string} [code=null]
 * @param {*} [details=null]
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

  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage = isProduction && statusCode === 500 ? 'An internal server error occurred.' : message;

  const responsePayload = {
    success: false,
    message: clientMessage,
    code: defaultCode,
  };

  if (!isProduction && details) {
    responsePayload.details = details;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse,
};
