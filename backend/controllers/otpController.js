const { sendOtp, retryOtp, verifyOtp } = require('../services/msg91Service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

const cleanMobileDigits = (num) => {
  const digits = String(num || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};

/**
 * Dispatch OTP via MSG91
 * POST /api/otp/send
 */
const sendOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, templateId, otp, otpExpiry } = req.body;

  const clean = cleanMobileDigits(mobile);
  if (!clean || clean.length !== 10 || !/^[6-9]/.test(clean)) {
    return errorResponse(res, 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.', 400);
  }

  const result = await sendOtp({ mobile: clean, templateId, otp, otpExpiry });
  return successResponse(res, result, result.message, 200);
});

/**
 * Resend OTP via SMS or Voice
 * POST /api/otp/retry
 */
const retryOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, retryType } = req.body;

  const clean = cleanMobileDigits(mobile);
  if (!clean || clean.length !== 10 || !/^[6-9]/.test(clean)) {
    return errorResponse(res, 'Please provide a valid 10-digit Indian mobile number', 400);
  }

  const result = await retryOtp({ mobile: clean, retryType });
  return successResponse(res, result, result.message, 200);
});

/**
 * Verify OTP entered by user
 * POST /api/otp/verify
 */
const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const clean = cleanMobileDigits(mobile);
  if (!clean || clean.length !== 10 || !/^[6-9]/.test(clean)) {
    return errorResponse(res, 'Please provide a valid 10-digit mobile number', 400);
  }

  const cleanOtp = String(otp || '').trim().replace(/\D/g, '');
  if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 6) {
    return errorResponse(res, 'OTP code must be a 4 to 6-digit number', 400);
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
