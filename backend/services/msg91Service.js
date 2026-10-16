let axios;
try {
  axios = require('axios');
} catch {
  axios = null;
}

const authKey = process.env.MSG91_AUTH_KEY;
const defaultTemplateId = process.env.MSG91_TEMPLATE_ID;

// In-memory simulation store for local testing without active MSG91 credentials
const sandboxOtpStore = new Map();

/**
 * Send an OTP using MSG91 SendOTP API v5
 */
const sendOtp = async ({
  mobile,
  templateId = defaultTemplateId,
  otp,
  otpExpiry = 10,
}) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const generatedOtp = otp || '1234';
    sandboxOtpStore.set(cleanMobile, {
      otp: String(generatedOtp),
      expiresAt: Date.now() + otpExpiry * 60 * 1000,
    });

    console.log(`\n[MSG91 Sandbox OTP] Mobile: +${cleanMobile} | Simulated OTP: ${generatedOtp}\n`);

    return {
      success: true,
      simulated: true,
      message: `OTP sent successfully. (Demo OTP: ${generatedOtp})`,
      mobile: cleanMobile,
      sandboxOtp: String(generatedOtp),
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
    console.error('[MSG91 Send OTP Error]:', errorMsg);
    throw new Error(`MSG91 Error: ${errorMsg}`);
  }
};

/**
 * Retry / Resend OTP
 */
const retryOtp = async ({ mobile, retryType = 'text' }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

  if (!authKey || authKey.startsWith('xxx')) {
    const newOtp = '1234';
    sandboxOtpStore.set(cleanMobile, {
      otp: newOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return {
      success: true,
      simulated: true,
      message: `OTP resent successfully. (Demo OTP: ${newOtp})`,
      sandboxOtp: newOtp,
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
 * Verify OTP entered by user
 */
const verifyOtp = async ({ mobile, otp }) => {
  const cleanMobile = String(mobile).replace(/[^0-9]/g, '');
  const cleanOtp = String(otp).trim();

  if (!authKey || authKey.startsWith('xxx') || authKey === 'your_msg91_auth_key') {
    const record = sandboxOtpStore.get(cleanMobile);
    const isValid = (record && record.otp === cleanOtp) || cleanOtp === '1234' || cleanOtp === '123456';

    if (isValid) {
      sandboxOtpStore.delete(cleanMobile);
      return {
        success: true,
        simulated: true,
        message: 'OTP verified successfully',
        type: 'success',
      };
    }

    return {
      success: false,
      simulated: true,
      message: 'Invalid or expired OTP code (Use 1234 for demo)',
      type: 'error',
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
    };
  }
};

module.exports = {
  sendOtp,
  retryOtp,
  verifyOtp,
};
