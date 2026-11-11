let axios;
try {
  axios = require('axios');
} catch {
  axios = null;
}

const crypto = require('crypto');
const logger = require('../utils/logger');
const env = require('../config/env');

const authKey = process.env.MSG91_AUTH_KEY || env.MSG91_AUTH_KEY;
const defaultTemplateId = process.env.MSG91_TEMPLATE_ID || env.MSG91_TEMPLATE_ID;
const isProd = process.env.NODE_ENV === 'production';

// In-memory simulation store with expiration, single-use, and attempt limiting
// Map<cleanMobile, { otp: string, expiresAt: number, attempts: number }>
const sandboxOtpStore = new Map();
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit OTP
 */
function generateSecureOtp() {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * Send an OTP using MSG91 SendOTP API v5
 */
const sendOtp = async ({
  mobile,
  templateId = defaultTemplateId,
  otp,
  otpExpiry = 10, // minutes
}) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    // Generate secure random OTP if not explicitly passed
    const generatedOtp = otp || (isProd ? generateSecureOtp() : '1234');
    sandboxOtpStore.set(cleanMobile, {
      otp: String(generatedOtp),
      expiresAt: Date.now() + otpExpiry * 60 * 1000,
      attempts: 0,
    });

    logger.info(`[MSG91 Sandbox OTP] OTP dispatched for mobile: +${cleanMobile.slice(0, 4)}****`);

    return {
      success: true,
      simulated: true,
      message: 'OTP sent successfully.',
      mobile: cleanMobile,
      // Never return raw OTP in production
      sandboxOtp: isProd ? undefined : String(generatedOtp),
      type: 'success',
    };
  }

  try {
    const params = {
      template_id: templateId,
      mobile: cleanMobile,
      authkey: authKey,
      otp_expiry: otpExpiry,
    };
    if (otp) params.otp = otp;

    const response = await axios.post('https://control.msg91.com/api/v5/otp', null, {
      params,
      headers: { 'Content-Type': 'application/json' },
    });

    return {
      success: true,
      simulated: false,
      message: response.data?.message || 'OTP dispatched successfully via MSG91',
      details: response.data,
      mobile: cleanMobile,
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    logger.error('[MSG91 Send OTP Error]', errorMsg);
    throw new Error(`MSG91 Error: ${errorMsg}`);
  }
};

/**
 * Retry / Resend OTP
 */
const retryOtp = async ({ mobile, retryType = 'text' }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const newOtp = isProd ? generateSecureOtp() : '1234';
    sandboxOtpStore.set(cleanMobile, {
      otp: newOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    return {
      success: true,
      simulated: true,
      message: 'OTP resent successfully.',
      sandboxOtp: isProd ? undefined : newOtp,
    };
  }

  try {
    const response = await axios.get('https://control.msg91.com/api/v5/otp/retry', {
      params: { authkey: authKey, mobile: cleanMobile, retrytype: retryType },
    });

    return {
      success: true,
      simulated: false,
      message: response.data?.message || 'OTP resent successfully',
      details: response.data,
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(`MSG91 Retry Error: ${errorMsg}`);
  }
};

/**
 * Verify OTP entered by user with attempt limits, expiry, and single-use invalidation
 */
const verifyOtp = async ({ mobile, otp }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');
  const cleanOtp = String(otp).trim();

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const record = sandboxOtpStore.get(cleanMobile);

    if (!record) {
      // In dev mode only, allow demo otp
      if (!isProd && (cleanOtp === '1234' || cleanOtp === '123456')) {
        return {
          success: true,
          simulated: true,
          message: 'OTP verified successfully (dev bypass)',
          type: 'success',
        };
      }
      return {
        success: false,
        simulated: true,
        message: 'No OTP requested for this mobile number or OTP has expired.',
        code: 'OTP_NOT_FOUND',
      };
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      sandboxOtpStore.delete(cleanMobile);
      return {
        success: false,
        simulated: true,
        message: 'OTP has expired. Please request a new one.',
        code: 'OTP_EXPIRED',
      };
    }

    // Check attempt limit
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > MAX_OTP_ATTEMPTS) {
      sandboxOtpStore.delete(cleanMobile);
      return {
        success: false,
        simulated: true,
        message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.',
        code: 'MAX_ATTEMPTS_EXCEEDED',
      };
    }

    const matchesStored = record.otp === cleanOtp;
    const matchesDevDemo = !isProd && (cleanOtp === '1234' || cleanOtp === '123456');

    if (matchesStored || matchesDevDemo) {
      // Single-use: delete immediately
      sandboxOtpStore.delete(cleanMobile);
      return {
        success: true,
        simulated: true,
        message: 'OTP verified successfully',
        type: 'success',
      };
    }

    const remaining = MAX_OTP_ATTEMPTS - record.attempts;
    return {
      success: false,
      simulated: true,
      message: `Invalid OTP code entered. ${remaining} attempt(s) remaining.`,
      code: 'INVALID_OTP',
    };
  }

  try {
    const response = await axios.get('https://control.msg91.com/api/v5/otp/verify', {
      params: { authkey: authKey, mobile: cleanMobile, otp: cleanOtp },
    });

    const isSuccess = response.data?.type === 'success' || response.data?.message?.toLowerCase().includes('success');

    return {
      success: isSuccess,
      simulated: false,
      message: response.data?.message || (isSuccess ? 'OTP verified successfully' : 'OTP verification failed'),
      details: response.data,
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    return {
      success: false,
      message: errorMsg,
      code: 'OTP_VERIFICATION_FAILED',
    };
  }
};

module.exports = {
  sendOtp,
  retryOtp,
  verifyOtp,
};
