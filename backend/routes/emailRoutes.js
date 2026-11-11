const express = require('express');
const router = express.Router();
const {
  sendCustomEmail,
  sendTemplateEmail,
} = require('../controllers/emailController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Protect email dispatch endpoints to prevent open mail relay abuse
router.post('/send', protectAdmin, sendCustomEmail);
router.post('/template', protectAdmin, sendTemplateEmail);

module.exports = router;
