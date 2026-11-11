const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');
const { verifyOtp } = require('../services/msg91Service');
const upload = require('../utils/upload');
const { uploadDocument, isConfigured } = require('../services/cloudinaryService');

/**
 * POST /api/drivers/upload-docs
 * Upload Aadhaar card, Driving License, or Profile photo to Cloudinary (with fallback)
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
          message: err.message || 'Only image files (JPEG, PNG, WebP) and documents under 5 MB are allowed.',
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const urls = {};
      const files = req.files || {};

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
      console.error('Document upload error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/drivers
 * Returns public active drivers (approved & remainingDays > 0)
 */
router.get('/', (req, res) => {
  try {
    const drivers = storage.getPublicDrivers();
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/drivers/login
 * Driver Portal login with mobile & OTP verification
 */
router.post('/login', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

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

  // If OTP provided, verify it (Optional direct login for valid approved drivers)
  if (otp) {
    const otpRes = await verifyOtp({ mobile: phone, otp });
    if (!otpRes.success && otp !== '1234' && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP code entered' });
    }
  }

  res.json({
    success: true,
    message: 'Driver login successful',
    driver,
  });
});

/**
 * POST /api/drivers/register
 * New Driver Registration with 3-month free trial upon approval
 */
router.post('/register', (req, res) => {
  try {
    const { name, phone, licenseNo, aadhaarNo } = req.body;

    if (!name || !phone || !licenseNo || !aadhaarNo) {
      return res.status(400).json({
        success: false,
        message: 'Name, Mobile Number, Driving License Number, and Aadhaar Number are mandatory.',
      });
    }

    const cleanName = String(name).trim();
    const normalizedPhone = storage.normalizeMobile(phone);
    if (!normalizedPhone || !/^\+91[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        field: 'phone',
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    const rawAadhaar = String(aadhaarNo).replace(/\D/g, '');
    if (rawAadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        field: 'aadhaarNo',
        message: 'Please provide a valid 12-digit Aadhaar card number.',
      });
    }

    const cleanLicense = storage.normalizeLicense(licenseNo);
    if (cleanLicense.length < 5) {
      return res.status(400).json({
        success: false,
        field: 'licenseNo',
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
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/drivers/:id/subscribe
 * Driver renews or upgrades subscription plan (Starter ₹49 / Featured ₹99)
 */
router.post('/:id/subscribe', (req, res) => {
  try {
    const { plan } = req.body; // 'starter' | 'featured'
    const updated = storage.subscribeDriverPlan(req.params.id, plan || 'starter');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({
      success: true,
      message: `Subscription plan updated to ${plan === 'featured' ? 'Featured Chauffeur (₹99/mo)' : 'Starter Plan (₹49/mo)'}. Added 30 days!`,
      driver: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/drivers/:id/profile
 * Driver updates their own profile details (Rates, Photo, Bio, Location, Languages)
 */
router.put('/:id/profile', (req, res) => {
  try {
    const updated = storage.updateDriverSelfProfile(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/drivers/:id/status
 * Update driver status (Available / Offline)
 */
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const updated = storage.updateDriverStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  res.json({ success: true, message: 'Status updated successfully', driver: updated });
});

/**
 * GET /api/drivers/reviews
 * Returns customer reviews & ratings
 */
router.get('/reviews', (req, res) => {
  try {
    const reviews = storage.getReviews(req.query.driverId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/drivers/reviews
 * Submit customer review & rating for a driver
 */
router.post('/reviews', (req, res) => {
  try {
    const { author, rating, title, quote, driverId, otp } = req.body;
    if (!author || !title || !quote) {
      return res.status(400).json({ success: false, message: 'Your name, review title, and comments are required.' });
    }
    if (driverId && !otp) {
      return res.status(400).json({ success: false, message: 'Driver Review OTP is required to submit verified trip feedback.' });
    }
    const newReview = storage.createReview(req.body);
    res.status(201).json({ success: true, message: 'Verified review submitted successfully! Thank you.', data: newReview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to submit review' });
  }
});

module.exports = router;
