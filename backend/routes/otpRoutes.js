const express = require('express');
const router = express.Router();
const {
  sendOtpHandler,
  retryOtpHandler,
  verifyOtpHandler,
} = require('../controllers/otpController');

router.post('/send', sendOtpHandler);
router.post('/retry', retryOtpHandler);
router.post('/verify', verifyOtpHandler);

module.exports = router;
