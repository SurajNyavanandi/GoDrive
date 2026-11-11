const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { authRegisterSchema, authLoginSchema } = require('../middleware/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(authRegisterSchema, 'body'), register);
router.post('/login', authLimiter, validate(authLoginSchema, 'body'), login);
router.get('/me', protect, getMe);

module.exports = router;
