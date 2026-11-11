const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const storage = require('../services/storageService');
const { verifyOtp } = require('../services/msg91Service');
const upload = require('../utils/upload');
const { validateFileSignature } = require('../utils/upload');
const { uploadDocument, isConfigured } = require('../services/cloudinaryService');
const env = require('../config/env');
const logger = require('../utils/logger');
const { validate } = require('../middleware/validateMiddleware');
const {
  driverLoginSchema,
  driverRegisterSchema,
  driverProfileUpdateSchema,
  driverStatusSchema,
  driverSubscribeSchema,
  driverReviewSchema,
  paginationQuerySchema,
} = require('../middleware/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

// IDOR protection helper: if token provided or in production, ensure ownership
function verifyDriverOwnership(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (!token) {
    if (isProd) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required to update driver record',
        code: 'UNAUTHORIZED',
      });
    }
    // Allow seamless dev mode execution if token not present in dev
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
    const adminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isAdmin =
      decoded.role === 'admin' ||
      (decoded.email && adminEmail && decoded.email.toLowerCase().trim() === adminEmail);

    if (isAdmin) {
      req.user = decoded;
      return next();
    }

    const callerId = String(decoded.id || decoded.driverId || '');
    const targetId = String(req.params.id || '');

    if (callerId && targetId && callerId === targetId) {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only update your own driver profile (IDOR restricted).',
      code: 'FORBIDDEN',
    });
  } catch (err) {
    logger.warn('Token verification error in driver ownership check:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * POST /api/drivers/upload-docs
 * Upload Aadhaar card, Driving License, or Profile photo to Cloudinary
 * Validates actual file content magic bytes to prevent file-type spoofing
 */
router.post(
  '/upload-docs',
  (req, res, next) => {
    upload.fields([
      { name: 'aadhaarPhoto', maxCount: 1 },
      { name: 'licensePhoto', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds the 5 MB limit. Please upload photos under 5 MB.',
          });
        }
        return res.status(400).json({
          success: false,
          code: 'INVALID_FILE',
          message: err.message || 'Only image files (JPEG, PNG, WebP) and PDF documents under 5 MB are allowed.',
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const urls = {};
      const files = req.files || {};

      // Validate magic bytes on file content
      for (const fieldName of ['aadhaarPhoto', 'licensePhoto', 'photo']) {
        if (files[fieldName] && files[fieldName][0]) {
          const file = files[fieldName][0];
          if (!validateFileSignature(file.buffer)) {
            return res.status(400).json({
              success: false,
              code: 'INVALID_FILE_SIGNATURE',
              message: `The uploaded file for ${fieldName} has invalid or corrupted content. Only authentic JPEG, PNG, WebP, and PDF files are permitted.`,
            });
          }
        }
      }

      if (files.aadhaarPhoto && files.aadhaarPhoto[0]) {
        const file = files.aadhaarPhoto[0];
        const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/aadhaar');
        urls.aadhaarPhoto = resUpload.url;
      }

      if (files.licensePhoto && files.licensePhoto[0]) {
        const file = files.licensePhoto[0];
        const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/license');
        urls.licensePhoto = resUpload.url;
      }

      if (files.photo && files.photo[0]) {
        const file = files.photo[0];
        const resUpload = await uploadDocument(file.buffer, file.mimetype, 'mana-drivers/avatars');
        urls.photo = resUpload.url;
      }

      res.json({
        success: true,
        message: 'Documents uploaded successfully',
        urls,
        isCloudinary: isConfigured,
      });
    } catch (err) {
      logger.error('Document upload error:', err);
      res.status(500).json({ success: false, message: err.message, code: 'UPLOAD_ERROR' });
    }
  }
);

/**
 * GET /api/drivers
 * Returns public active drivers with pagination & 60s HTTP cache header
 */
router.get('/', validate(paginationQuerySchema, 'query'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = storage.getPublicDriversPaged(page, limit);

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/drivers/login
 * Driver Portal login with mobile & OTP verification + JWT generation
 */
router.post('/login', authLimiter, validate(driverLoginSchema, 'body'), async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const driver = storage.getDriverByPhone(phone);
    if (!driver) {
      return res.status(404).json({
        success: false,
        code: 'UNREGISTERED',
        message: 'You are not yet registered. Please submit your driver registration form.',
      });
    }

    // Check if driver is pending approval by admin
    if (!driver.isApproved) {
      return res.status(200).json({
        success: false,
        code: 'PENDING_APPROVAL',
        message: 'Your driver registration is pending admin approval. You will be able to log in once an admin approves your profile.',
        driver,
      });
    }

    const isProd = process.env.NODE_ENV === 'production';

    // Verify OTP
    if (otp) {
      const otpRes = await verifyOtp({ mobile: phone, otp });
      const devBypass = !isProd && (otp === '1234' || otp === '123456');
      if (!otpRes.success && !devBypass) {
        return res.status(400).json({ success: false, message: otpRes.message || 'Invalid or expired OTP code', code: 'INVALID_OTP' });
      }
    }

    // Generate signed JWT token for logged-in driver session
    const token = jwt.sign(
      { id: driver.id, driverId: driver.id, phone: driver.phone, role: 'driver' },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Driver login successful',
      token,
      driver,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/drivers/register
 * New Driver Registration with 3-month free trial upon approval
 */
router.post('/register', authLimiter, validate(driverRegisterSchema, 'body'), (req, res) => {
  try {
    const { name, phone, licenseNo, aadhaarNo } = req.body;

    const cleanName = String(name).trim();
    const normalizedPhone = storage.normalizeMobile(phone);
    if (!normalizedPhone || !/^\+91[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        field: 'phone',
        code: 'INVALID_PHONE',
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    const rawAadhaar = String(aadhaarNo).replace(/\D/g, '');
    if (rawAadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        field: 'aadhaarNo',
        code: 'INVALID_AADHAAR',
        message: 'Please provide a valid 12-digit Aadhaar card number.',
      });
    }

    const cleanLicense = storage.normalizeLicense(licenseNo);
    if (cleanLicense.length < 5) {
      return res.status(400).json({
        success: false,
        field: 'licenseNo',
        code: 'INVALID_LICENSE',
        message: 'Please provide a valid Driving License Number.',
      });
    }

    const result = storage.registerNewDriver({
      ...req.body,
      name: cleanName,
      phone: normalizedPhone,
      licenseNo: cleanLicense,
      aadhaarNo: storage.formatAadhaar(rawAadhaar),
    });

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Application Submitted Successfully! Included 90 days (3 Months) Free Trial upon admin approval.',
      driver: result.driver,
    });
  } catch (err) {
    if (err.statusCode === 409 || err.code === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_ENTRY',
        field: err.field,
        message: err.message,
      });
    }
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/drivers/:id/subscribe
 * Driver renews or upgrades subscription plan with ownership check
 */
router.post('/:id/subscribe', verifyDriverOwnership, validate(driverSubscribeSchema, 'body'), (req, res) => {
  try {
    const { plan } = req.body;
    const updated = storage.subscribeDriverPlan(req.params.id, plan || 'starter');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({
      success: true,
      message: `Subscription plan updated to ${plan === 'featured' ? 'Featured Chauffeur (₹99/mo)' : 'Starter Plan (₹49/mo)'}. Added 30 days!`,
      driver: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/drivers/:id/profile
 * Driver updates their own profile details with ownership check
 */
router.put('/:id/profile', verifyDriverOwnership, validate(driverProfileUpdateSchema, 'body'), (req, res) => {
  try {
    const updated = storage.updateDriverSelfProfile(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Profile updated successfully', driver: updated });
  } catch (err) {
    if (err.statusCode === 409 || err.code === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_ENTRY',
        field: err.field,
        message: err.message,
      });
    }
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/drivers/:id/status
 * Update driver status with ownership check
 */
router.put('/:id/status', verifyDriverOwnership, validate(driverStatusSchema, 'body'), (req, res) => {
  const { status } = req.body;
  const updated = storage.updateDriverStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
  }

  res.json({ success: true, message: 'Status updated successfully', driver: updated });
});

/**
 * GET /api/drivers/reviews
 * Returns customer reviews & ratings with pagination & caching
 */
router.get('/reviews', validate(paginationQuerySchema, 'query'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = storage.getReviewsPaged(req.query.driverId, page, limit);

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/drivers/reviews
 * Submit customer review & rating for a driver
 */
router.post('/reviews', validate(driverReviewSchema, 'body'), (req, res) => {
  try {
    const { author, title, quote, driverId, otp } = req.body;
    if (!author || !title || !quote) {
      return res.status(400).json({ success: false, message: 'Your name, review title, and comments are required.', code: 'VALIDATION_ERROR' });
    }
    if (driverId && !otp) {
      return res.status(400).json({ success: false, message: 'Driver Review OTP is required to submit verified trip feedback.', code: 'OTP_REQUIRED' });
    }
    const newReview = storage.createReview(req.body);
    res.status(201).json({ success: true, message: 'Verified review submitted successfully! Thank you.', data: newReview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to submit review', code: 'BAD_REQUEST' });
  }
});

module.exports = router;
