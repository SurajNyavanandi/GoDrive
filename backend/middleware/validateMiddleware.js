const { z } = require('zod');

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
        return res.status(400).json({
          success: false,
          message: formattedErrors[0]?.message || 'Validation error',
          code: 'VALIDATION_ERROR',
          field: formattedErrors[0]?.field,
          errors: process.env.NODE_ENV !== 'production' ? formattedErrors : undefined,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};

module.exports = {
  validate,
  z,
};
