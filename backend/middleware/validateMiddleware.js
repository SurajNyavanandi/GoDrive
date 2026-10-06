const { z } = require('zod');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Express middleware to validate request payload against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return errorResponse(
          res,
          formattedErrors[0]?.message || 'Validation error',
          400,
          formattedErrors
        );
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
};

module.exports = {
  validate,
  z,
};
