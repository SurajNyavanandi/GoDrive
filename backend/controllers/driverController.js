const jwt = require('jsonwebtoken');
const driverService = require('../services/driverService');
const reviewService = require('../services/reviewService');
const { verifyOtp } = require('../services/msg91Service');
const { validateFileSignature } = require('../utils/upload');
const { uploadDocument, isConfigured } = require('../services/cloudinaryService');
const env = require('../config/env');
const logger = require('../utils/logger');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { normalizeMobile, formatAadhaar, normalizeLicense } = require('../utils/formatters');
const { HTTP_STATUS, PAGINATION } = require('../config/constants');

const uploadDocsHandler = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const uploadedFields = Object.keys(files);

  if (uploadedFields.length === 0) {
    return errorResponse(res, 'Please select at least one document or photo to upload.', HTTP_STATUS.BAD_REQUEST, 'NO_FILES');
  }

  // Check magic byte signatures on actual file contents
  for (const field of uploadedFields) {
    const file = files[field][0];
    const valid = validateFileSignature(file.buffer);
    if (!valid) {
      return errorResponse(
        res,
        `File uploaded for "${field}" does not match permitted image formats (JPEG, PNG, WebP).`,
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_FILE_CONTENT'
      );
    }
  }

  const urls = {};

  if (files.aadhaarPhoto && files.aadhaarPhoto[0]) {
    const file = files.aadhaarPhoto[0];
    const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/kyc');
    urls.aadhaarPhoto = resUpload.url;
  }

  if (files.licensePhoto && files.licensePhoto[0]) {
    const file = files.licensePhoto[0];
    const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/kyc');
    urls.licensePhoto = resUpload.url;
  }

  if (files.photo && files.photo[0]) {
    const file = files.photo[0];
    const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/avatars');
    urls.photo = resUpload.url;
  }

  return res.json({
    success: true,
    message: 'Documents uploaded successfully',
    urls,
    isCloudinary: isConfigured,
  });
});

const getPublicDriversHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const result = await driverService.getPublicDriversPaged(page, limit);

  res.set('Cache-Control', 'public, max-age=60');
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

const loginDriverHandler = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const driver = await driverService.getDriverByPhone(phone);
  if (!driver) {
    return errorResponse(res, 'You are not yet registered. Please submit your driver registration form.', HTTP_STATUS.NOT_FOUND, 'UNREGISTERED');
  }

  if (!driver.isApproved) {
    return res.status(HTTP_STATUS.OK).json({
      success: false,
      code: 'PENDING_APPROVAL',
      message: 'Your driver registration is pending admin approval. You will be able to log in once an admin approves your profile.',
      driver,
    });
  }

  const isProd = env.NODE_ENV === 'production';

  if (otp) {
    const otpRes = await verifyOtp({ mobile: phone, otp });
    const devBypass = !isProd && (otp === '1234' || otp === '123456');
    if (!otpRes.success && !devBypass) {
      return errorResponse(res, otpRes.message || 'Invalid or expired OTP code', HTTP_STATUS.BAD_REQUEST, 'INVALID_OTP');
    }
  }

  const token = jwt.sign(
    { id: driver.id, driverId: driver.id, phone: driver.phone, role: 'driver' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE || '7d' }
  );

  return res.json({
    success: true,
    message: 'Driver login successful',
    token,
    driver,
  });
});

const registerDriverHandler = asyncHandler(async (req, res) => {
  const { name, phone, licenseNo, aadhaarNo } = req.body;

  const cleanName = String(name).trim();
  const normalizedPhone = normalizeMobile(phone);
  if (!normalizedPhone || !/^\+91[6-9]\d{9}$/.test(normalizedPhone)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      field: 'phone',
      code: 'INVALID_PHONE',
      message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    });
  }

  const rawAadhaar = String(aadhaarNo).replace(/\D/g, '');
  if (rawAadhaar.length !== 12) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      field: 'aadhaarNo',
      code: 'INVALID_AADHAAR',
      message: 'Please provide a valid 12-digit Aadhaar card number.',
    });
  }

  const cleanLicense = normalizeLicense(licenseNo);
  if (cleanLicense.length < 5) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      field: 'licenseNo',
      code: 'INVALID_LICENSE',
      message: 'Please provide a valid Driving License Number.',
    });
  }

  const driver = await driverService.registerNewDriver({
    ...req.body,
    name: cleanName,
    phone: normalizedPhone,
    licenseNo: cleanLicense,
    aadhaarNo: formatAadhaar(rawAadhaar),
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Application Submitted Successfully! Included 90 days (3 Months) Free Trial upon admin approval.',
    driver,
  });
});

const subscribePlanHandler = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const updated = await driverService.subscribeDriverPlan(req.params.id, plan || 'starter');
  if (!updated) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: `Subscription plan updated to ${plan === 'featured' ? 'Featured Chauffeur (₹99/mo)' : 'Starter Plan (₹49/mo)'}. Added 30 days!`,
    driver: updated,
  });
});

const updateSelfProfileHandler = asyncHandler(async (req, res) => {
  const updated = await driverService.updateDriverSelfProfile(req.params.id, req.body);
  if (!updated) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({ success: true, message: 'Profile updated successfully', driver: updated });
});

const updateStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await driverService.updateDriverStatus(req.params.id, status);
  if (!updated) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({ success: true, message: 'Status updated successfully', driver: updated });
});

const getReviewsHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const result = await reviewService.getReviewsPaged(req.query.driverId, page, limit);

  res.set('Cache-Control', 'public, max-age=60');
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

const createReviewHandler = asyncHandler(async (req, res) => {
  const { author, title, quote, driverId, otp } = req.body;
  if (!author || !title || !quote) {
    return errorResponse(res, 'Your name, review title, and comments are required.', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  if (driverId && !otp) {
    return errorResponse(res, 'Driver Review OTP is required to submit verified trip feedback.', HTTP_STATUS.BAD_REQUEST, 'OTP_REQUIRED');
  }
  const newReview = await reviewService.createReview(req.body);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Verified review submitted successfully! Thank you.',
    data: newReview,
  });
});

module.exports = {
  uploadDocsHandler,
  getPublicDriversHandler,
  loginDriverHandler,
  registerDriverHandler,
  subscribePlanHandler,
  updateSelfProfileHandler,
  updateStatusHandler,
  getReviewsHandler,
  createReviewHandler,
};
