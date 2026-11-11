const express = require('express');
const router = express.Router();
const {
  sendOtpHandler,
  retryOtpHandler,
  verifyOtpHandler,
} = require('../controllers/otpController');
const { validate } = require('../middleware/validateMiddleware');
const { otpSendSchema, otpRetrySchema, otpVerifySchema } = require('../middleware/schemas');
const { otpLimiter } = require('../middleware/rateLimiter');

router.post('/send', otpLimiter, validate(otpSendSchema, 'body'), sendOtpHandler);
router.post('/retry', otpLimiter, validate(otpRetrySchema, 'body'), retryOtpHandler);
router.post('/verify', otpLimiter, validate(otpVerifySchema, 'body'), verifyOtpHandler);

module.exports = router;
