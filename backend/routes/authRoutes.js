const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { authRegisterSchema, authLoginSchema, authRefreshSchema } = require('../middleware/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(authRegisterSchema, 'body'), register);
router.post('/login', authLimiter, validate(authLoginSchema, 'body'), login);
router.post('/refresh', authLimiter, validate(authRefreshSchema, 'body'), refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
