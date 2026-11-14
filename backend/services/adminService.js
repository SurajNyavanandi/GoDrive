const crypto = require('crypto');
const AdminHistory = require('../models/AdminHistory');
const User = require('../models/User');
const env = require('../config/env');
const resendService = require('./resendService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');
const { PAGINATION, HTTP_STATUS } = require('../config/constants');

/**
 * Validates whether an email is present in the authorized admin list.
 */
function isAuthorizedAdminEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  return Boolean(cleanEmail && Array.isArray(env.adminEmails) && env.adminEmails.includes(cleanEmail));
}

/**
 * Authenticates an authorized admin with email & password.
 */
async function authenticateAdmin({ email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isAuthorizedAdminEmail(cleanEmail)) {
    throw new AppError('Invalid credentials or unauthorized account.', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  const user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }

  if (user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }

  const token = user.getSignedJwtToken();
  await recordAdminAction('ADMIN_LOGIN', 'user', user._id, user.name || cleanEmail, { email: cleanEmail });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: 'admin',
    },
  };
}

/**
 * Dispatches a 6-digit setup verification code to an authorized admin email.
 */
async function requestAdminPasswordSetup(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isAuthorizedAdminEmail(cleanEmail)) {
    throw new AppError('This email is not authorized for portal access.', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }

  let user = await User.findOne({ email: cleanEmail });
  if (!user) {
    const tempPass = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      password: tempPass,
      role: 'admin',
    });
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const hashedToken = crypto.createHash('sha256').update(verificationCode).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
  await user.save({ validateBeforeSave: false });

  await resendService.sendAdminPasswordSetupEmail({ to: cleanEmail, code: verificationCode });
  logger.info(`Password setup code dispatched for admin: ${cleanEmail}`);

  return {
    success: true,
    message: 'Verification code sent to your email address.',
  };
}

/**
 * Verifies code and sets new password for authorized admin.
 */
async function setAdminPassword({ email, token, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isAuthorizedAdminEmail(cleanEmail)) {
    throw new AppError('This email is not authorized for portal access.', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }

  const hashedToken = crypto.createHash('sha256').update(String(token).trim()).digest('hex');

  const user = await User.findOne({
    email: cleanEmail,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    throw new AppError('Invalid or expired verification code.', HTTP_STATUS.BAD_REQUEST, 'INVALID_CODE');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.role = 'admin';
  await user.save();

  const authToken = user.getSignedJwtToken();
  await recordAdminAction('ADMIN_PASSWORD_SET', 'user', user._id, user.name || cleanEmail, { email: cleanEmail });

  return {
    token: authToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: 'admin',
    },
    message: 'Password configured successfully.',
  };
}

/**
 * Records an immutable administrative action audit log entry.
 */
async function recordAdminAction(actionType, targetType, targetId, targetName, details = {}, previousState = null) {
  try {
    const payload = {
      id: `hist-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      actionType,
      targetType,
      targetId: String(targetId || ''),
      targetName: String(targetName || ''),
      details,
      previousState,
    };

    const doc = await AdminHistory.create(payload);
    return doc.toObject ? doc.toObject() : doc;
  } catch (err) {
    logger.error('Failed to record admin history audit log:', err.message);
    return null;
  }
}

/**
 * Retrieves paginated chronological admin audit history.
 */
async function getAdminHistoryPaged(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT));

  const total = await AdminHistory.countDocuments({});
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const data = await AdminHistory.find({})
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

module.exports = {
  authenticateAdmin,
  requestAdminPasswordSetup,
  setAdminPassword,
  recordAdminAction,
  getAdminHistoryPaged,
};
