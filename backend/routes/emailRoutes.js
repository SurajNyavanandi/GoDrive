const express = require('express');
const router = express.Router();
const {
  sendCustomEmail,
  sendTemplateEmail,
} = require('../controllers/emailController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { emailSendSchema, emailTemplateSchema } = require('../middleware/schemas');

// Protect email dispatch endpoints to prevent open mail relay abuse
router.post('/send', protectAdmin, validate(emailSendSchema, 'body'), sendCustomEmail);
router.post('/template', protectAdmin, validate(emailTemplateSchema, 'body'), sendTemplateEmail);

module.exports = router;
