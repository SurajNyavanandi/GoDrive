const { z } = require('zod');
const mongoose = require('mongoose');
const env = require('../config/env');

/**
 * Express middleware to validate request payload against a Zod schema.
 * Replaces req[source] with the parsed/sanitized data.
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
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        const primaryMessage = formattedErrors[0]?.message || 'Validation error';
        const primaryField = formattedErrors[0]?.field;
        return res.status(400).json({
          success: false,
          message: primaryMessage,
          code: 'VALIDATION_ERROR',
          field: primaryField,
          errors: !env.isProduction ? formattedErrors : undefined,
          error: {
            code: 'VALIDATION_ERROR',
            message: primaryMessage,
            field: primaryField,
            details: !env.isProduction ? formattedErrors : undefined,
          },
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
        },
      });
    }
  };
};

/**
 * Validates that a route parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 * @param {string} [paramName='id'] - The parameter key in req.params
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid format for parameter '${paramName}': ${value}`,
        code: 'INVALID_ID',
        field: paramName,
        error: {
          code: 'INVALID_ID',
          message: `Invalid format for parameter '${paramName}': ${value}`,
          field: paramName,
        },
      });
    }
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  z,
};
