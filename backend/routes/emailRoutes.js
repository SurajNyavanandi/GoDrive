const express = require('express');
const router = express.Router();
const {
  sendCustomEmail,
  sendTemplateEmail,
} = require('../controllers/emailController');

router.post('/send', sendCustomEmail);
router.post('/template', sendTemplateEmail);

module.exports = router;
