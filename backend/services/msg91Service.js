const axios = require('axios');

const authKey = process.env.MSG91_AUTH_KEY;
const defaultTemplateId = process.env.MSG91_TEMPLATE_ID;

// In-memory simulation store for local testing without active MSG91 credentials
const sandboxOtpStore = new Map();

/**
 * Send an OTP using MSG91 SendOTP API v5
 * @param {Object} options
 * @param {string} options.mobile - Mobile number with country code (e.g. 919876543210)
 * @param {string} [options.templateId] - MSG91 DLT template ID
 * @param {string} [options.otp] - Optional custom OTP value
 * @param {number} [options.otpExpiry] - Expiry in minutes (default 5)
 */
const sendOtp = async ({
  mobile,
  templateId = defaultTemplateId,
  otp,
  otpExpiry = 5,
}) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const generatedOtp = otp || String(Math.floor(100000 + Math.random() * 900000));
    sandboxOtpStore.set(cleanMobile, {
      otp: String(generatedOtp),
      expiresAt: Date.now() + otpExpiry * 60 * 1000,
    });

    console.log('\n[MSG91 Service - Sandbox Simulation]');
    console.log(`Mobile: +${cleanMobile}`);
    console.log(`Simulated OTP: ${generatedOtp}`);
    console.log(`Expires in: ${otpExpiry} minutes\n`);

    return {
      success: true,
      simulated: true,
      message: 'OTP sent in sandbox mode. Check server logs for OTP code.',
      mobile: cleanMobile,
      sandboxOtp: generatedOtp,
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('[MSG91 Send OTP Error]:', errorMsg);
    throw new Error(`MSG91 Error: ${errorMsg}`);
  }
};

/**
 * Retry / Resend OTP via Voice or SMS
 * @param {Object} options
 * @param {string} options.mobile - Mobile number with country code
 * @param {string} [options.retryType] - 'text' or 'voice' (default 'text')
 */
const retryOtp = async ({ mobile, retryType = 'text' }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx')) {
    const existing = sandboxOtpStore.get(cleanMobile);
    const newOtp = existing?.otp || String(Math.floor(100000 + Math.random() * 900000));
    sandboxOtpStore.set(cleanMobile, {
      otp: newOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`\n[MSG91 Sandbox Retry] (${retryType}) to +${cleanMobile}: OTP = ${newOtp}\n`);

    return {
      success: true,
      simulated: true,
      message: `OTP retry simulated via ${retryType}`,
      sandboxOtp: newOtp,
    };
  }

  try {
    const response = await axios.get('https://control.msg91.com/api/v5/otp/retry', {
      params: {
        authkey: authKey,
        mobile: cleanMobile,
        retrytype: retryType,
      },
    });

    return {
      success: true,
      simulated: false,
      message: response.data?.message || 'OTP resent successfully',
      details: response.data,
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error('[MSG91 Retry Error]:', errorMsg);
    throw new Error(`MSG91 Retry Error: ${errorMsg}`);
  }
};

/**
 * Verify OTP entered by user
 * @param {Object} options
 * @param {string} options.mobile - Mobile number with country code
 * @param {string} options.otp - The 4-6 digit OTP code
 */
const verifyOtp = async ({ mobile, otp }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');
  const cleanOtp = String(otp).trim();

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const record = sandboxOtpStore.get(cleanMobile);
    
    // Accept standard default test code 123456 or in-memory generated OTP
    const isValid = (record && record.otp === cleanOtp && record.expiresAt > Date.now()) || cleanOtp === '123456';

    if (isValid) {
      sandboxOtpStore.delete(cleanMobile);
      return {
        success: true,
        simulated: true,
        message: 'OTP verified successfully (sandbox mode)',
        type: 'success',
      };
    }

    return {
      success: false,
      simulated: true,
      message: 'Invalid or expired OTP code (sandbox)',
      type: 'error',
    };
  }

  try {
    const response = await axios.get('https://control.msg91.com/api/v5/otp/verify', {
      params: {
        authkey: authKey,
        mobile: cleanMobile,
        otp: cleanOtp,
      },
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
    console.error('[MSG91 Verify OTP Error]:', errorMsg);
    return {
      success: false,
      message: errorMsg,
    };
  }
};

module.exports = {
  sendOtp,
  retryOtp,
  verifyOtp,
};
