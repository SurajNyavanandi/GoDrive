const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const defaultFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Initialize Resend SDK instance if valid API key is present
const resendClient = apiKey && !apiKey.startsWith('re_xxx') ? new Resend(apiKey) : null;

/**
 * Send a general email via Resend
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML content
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.from] - Sender email address
 */
const sendEmail = async ({ to, subject, html, text, from = defaultFromEmail }) => {
  const recipients = Array.isArray(to) ? to : [to];

  if (!resendClient) {
    console.log('\n[Resend Service - Sandbox Simulation]');
    console.log(`To: ${recipients.join(', ')}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html}\n`);

    return {
      success: true,
      id: `sim_resend_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      simulated: true,
      message: 'Email logged to server console (sandbox simulation mode)',
      details: { to: recipients, subject, from },
    };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    return {
      success: true,
      id: data?.id,
      simulated: false,
      message: 'Email sent successfully via Resend',
      details: data,
    };
  } catch (error) {
    console.error('[Resend Service Error]:', error.message);
    throw error;
  }
};

/**
 * Send a welcome email template
 */
const sendWelcomeEmail = async ({ to, name = 'User', appName = 'VIRAT TOM' }) => {
  const subject = `Welcome to ${appName}! 🚀`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-bottom: 12px;">Welcome, ${name}! 👋</h1>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        We're thrilled to have you onboard at <strong>${appName}</strong>. Your account has been setup and you're ready to explore.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #64748b; font-size: 13px; margin: 0;">Need any assistance? Reply directly to this email anytime.</p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  `;
  const text = `Welcome to ${appName}, ${name}! Your account has been initialized.`;

  return sendEmail({ to, subject, html, text });
};

/**
 * Send OTP Verification email
 */
const sendOtpEmail = async ({ to, otp, expiresInMinutes = 10, appName = 'VIRAT TOM' }) => {
  const subject = `Your ${appName} Verification Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Verification Code</h2>
      <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Use the following one-time passcode to complete your verification in ${appName}:</p>
      <div style="background: #0071e3; color: #ffffff; letter-spacing: 6px; font-size: 28px; font-weight: 700; text-align: center; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">This code will expire in ${expiresInMinutes} minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;
  const text = `Your verification code for ${appName} is ${otp}. Valid for ${expiresInMinutes} minutes.`;

  return sendEmail({ to, subject, html, text });
};

/**
 * Send Password Reset email
 */
const sendPasswordResetEmail = async ({ to, resetUrl, name = 'User', appName = 'VIRAT TOM' }) => {
  const subject = `Reset Your ${appName} Password`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Hello ${name}, we received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">Or copy and paste this URL into your browser: <br/>${resetUrl}</p>
    </div>
  `;
  const text = `Reset your password by visiting: ${resetUrl}`;

  return sendEmail({ to, subject, html, text });
};

module.exports = {
  resendClient,
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};
