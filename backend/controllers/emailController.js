const {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
} = require('../services/resendService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * Send custom or transactional email
 * POST /api/email/send
 */
const sendCustomEmail = asyncHandler(async (req, res) => {
  const { to, subject, html, text, from } = req.body;

  if (!to || !subject) {
    return errorResponse(res, 'Please provide "to" and "subject" fields', 400);
  }

  const result = await sendEmail({ to, subject, html, text, from });
  return successResponse(res, result, result.message, 200);
});

/**
 * Send pre-built template email (welcome / otp / reset)
 * POST /api/email/template
 */
const sendTemplateEmail = asyncHandler(async (req, res) => {
  const { template, to, name, otp, resetUrl, appName } = req.body;

  if (!to || !template) {
    return errorResponse(res, 'Please provide "to" and "template" (welcome, otp, or reset)', 400);
  }

  let result;
  switch (template.toLowerCase()) {
    case 'welcome':
      result = await sendWelcomeEmail({ to, name, appName });
      break;
    case 'otp':
      if (!otp) {
        return errorResponse(res, 'The "otp" parameter is required for OTP email template', 400, 'VALIDATION_ERROR');
      }
      result = await sendOtpEmail({ to, otp, appName });
      break;
    case 'reset':
    case 'password_reset':
      if (!resetUrl) {
        return errorResponse(res, 'The "resetUrl" parameter is required for password reset email template', 400, 'VALIDATION_ERROR');
      }
      result = await sendPasswordResetEmail({
        to,
        name,
        resetUrl,
        appName,
      });
      break;
    default:
      return errorResponse(res, `Unknown template: ${template}. Supported: welcome, otp, reset`, 400);
  }

  return successResponse(res, result, result.message, 200);
});

module.exports = {
  sendCustomEmail,
  sendTemplateEmail,
};
