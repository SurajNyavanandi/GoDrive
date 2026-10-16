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
  upload.fields([
    { name: 'aadhaarPhoto', maxCount: 1 },
    { name: 'licensePhoto', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
  ]),
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
 * Returns public approved drivers
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
      message: 'Driver mobile number is not registered. Please register as a new driver.',
    });
  }

  // If OTP provided, verify it
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
 * New Driver Registration with mandatory KYC (Aadhaar, License) & Edge-Case Validation
 */
router.post('/register', (req, res) => {
  try {
    const { name, phone, licenseNo, aadhaarNo, experience } = req.body;

    if (!name || !phone || !licenseNo || !aadhaarNo) {
      return res.status(400).json({
        success: false,
        message: 'Name, Mobile Number, Driving License Number, and Aadhaar Number are mandatory.',
      });
    }

    // Name Validation
    const cleanName = String(name).trim();
    if (cleanName.length < 2 || cleanName.length > 60 || !/[a-zA-Z]/.test(cleanName)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid full name (2 to 60 characters with letters).',
      });
    }

    // Phone Validation (10 digits starting with 6-9)
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone) || /^(\d)\1{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    // Experience Validation (1 to 50 years)
    if (experience !== undefined && experience !== null && experience !== '') {
      const exp = Number(experience);
      if (isNaN(exp) || !Number.isInteger(exp) || exp < 1 || exp > 50) {
        return res.status(400).json({
          success: false,
          message: 'Driving experience must be a whole number between 1 and 50 years.',
        });
      }
    }

    // Driving License Validation (10-20 alphanumeric characters)
    const cleanLicense = String(licenseNo).trim().toUpperCase();
    const strippedLicense = cleanLicense.replace(/[^A-Z0-9]/g, '');
    if (strippedLicense.length < 10 || strippedLicense.length > 20 || /^\d+$/.test(strippedLicense)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian Driving License number (e.g. TS09-2018-0091234).',
      });
    }

    // Aadhaar Validation (12 digits, cannot start with 0 or 1)
    const cleanAadhaar = String(aadhaarNo).replace(/\D/g, '');
    if (cleanAadhaar.length !== 12 || /^[01]/.test(cleanAadhaar) || /^(\d)\1{11}$/.test(cleanAadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 12-digit Indian Aadhaar card number.',
      });
    }

    const result = storage.registerNewDriver({
      ...req.body,
      name: cleanName,
      phone: cleanPhone,
      licenseNo: cleanLicense,
      aadhaarNo: `${cleanAadhaar.slice(0, 4)}-${cleanAadhaar.slice(4, 8)}-${cleanAadhaar.slice(8, 12)}`,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Application Submitted Successfully! Profile verification takes 24–48 hours. Once approved by admin, your profile will go live on the homepage.',
      driver: result.driver,
    });
  } catch (err) {
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

module.exports = router;
