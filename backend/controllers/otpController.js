const { sendOtp, retryOtp, verifyOtp } = require('../services/msg91Service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Dispatch OTP via MSG91
 * POST /api/otp/send
 */
const sendOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, templateId, otp, otpExpiry } = req.body;

  if (!mobile) {
    return errorResponse(res, 'Please provide a valid mobile number with country code', 400);
  }

  const result = await sendOtp({ mobile, templateId, otp, otpExpiry });
  return successResponse(res, result, result.message, 200);
});

/**
 * Resend OTP via SMS or Voice
 * POST /api/otp/retry
 */
const retryOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, retryType } = req.body;

  if (!mobile) {
    return errorResponse(res, 'Please provide mobile number', 400);
  }

  const result = await retryOtp({ mobile, retryType });
  return successResponse(res, result, result.message, 200);
});

/**
 * Verify OTP entered by user
 * POST /api/otp/verify
 */
const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return errorResponse(res, 'Please provide both mobile number and OTP code', 400);
  }

  const result = await verifyOtp({ mobile, otp });
  if (!result.success) {
    return errorResponse(res, result.message || 'Invalid or expired OTP', 400);
  }

  return successResponse(res, result, result.message, 200);
});

module.exports = {
  sendOtpHandler,
  retryOtpHandler,
  verifyOtpHandler,
};
