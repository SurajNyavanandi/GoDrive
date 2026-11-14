const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyDriverOwnership } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');
const { validate } = require('../middleware/validateMiddleware');
const {
  driverLoginSchema,
  driverRegisterSchema,
  driverProfileUpdateSchema,
  driverStatusSchema,
  driverSubscribeSchema,
  driverReviewSchema,
  paginationQuerySchema,
  idParamSchema,
} = require('../middleware/schemas');
const { authLimiter } = require('../middleware/rateLimiter');

// File upload middleware for driver KYC documents & profile photo
const driverDocsUpload = (req, res, next) => {
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
        code: 'UPLOAD_ERROR',
        message: err.message || 'File upload error',
      });
    }
    next();
  });
};

router.post('/upload-docs', driverDocsUpload, driverController.uploadDocsHandler);
router.get('/', validate(paginationQuerySchema, 'query'), driverController.getPublicDriversHandler);
router.post('/login', authLimiter, validate(driverLoginSchema, 'body'), driverController.loginDriverHandler);
router.post('/register', authLimiter, validate(driverRegisterSchema, 'body'), driverController.registerDriverHandler);
router.post('/:id/subscribe', validate(idParamSchema, 'params'), verifyDriverOwnership, validate(driverSubscribeSchema, 'body'), driverController.subscribePlanHandler);
router.put('/:id/profile', validate(idParamSchema, 'params'), verifyDriverOwnership, validate(driverProfileUpdateSchema, 'body'), driverController.updateSelfProfileHandler);
router.patch('/:id/profile', validate(idParamSchema, 'params'), verifyDriverOwnership, validate(driverProfileUpdateSchema, 'body'), driverController.updateSelfProfileHandler);
router.put('/:id/status', validate(idParamSchema, 'params'), verifyDriverOwnership, validate(driverStatusSchema, 'body'), driverController.updateStatusHandler);
router.patch('/:id/status', validate(idParamSchema, 'params'), verifyDriverOwnership, validate(driverStatusSchema, 'body'), driverController.updateStatusHandler);
router.get('/reviews', validate(paginationQuerySchema, 'query'), driverController.getReviewsHandler);
router.post('/reviews', validate(driverReviewSchema, 'body'), driverController.createReviewHandler);

module.exports = router;
