const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  driverRegisterSchema,
  driverProfileUpdateSchema,
  adminSubscriptionSchema,
  adminReasonSchema,
  adminPricingSchema,
  paginationQuerySchema,
  idParamSchema,
  adminRestoreSchema,
  adminLoginSchema,
  adminRequestPasswordSetupSchema,
  adminSetPasswordSchema,
} = require('../middleware/schemas');

// Public Admin Authentication Endpoints (rate limited)
router.post('/login', authLimiter, validate(adminLoginSchema, 'body'), adminController.adminLoginHandler);
router.post('/request-password-setup', authLimiter, validate(adminRequestPasswordSetupSchema, 'body'), adminController.requestPasswordSetupHandler);
router.post('/set-password', authLimiter, validate(adminSetPasswordSchema, 'body'), adminController.setPasswordHandler);

// Enforce server-side Admin Authentication for all protected admin routes
router.use(protectAdmin);

router.get('/drivers', validate(paginationQuerySchema, 'query'), adminController.getAdminDriversHandler);
router.post('/drivers', validate(driverRegisterSchema, 'body'), adminController.createAdminDriverHandler);
router.put('/drivers/:id', validate(idParamSchema, 'params'), validate(driverProfileUpdateSchema, 'body'), adminController.updateAdminDriverHandler);
router.patch('/drivers/:id', validate(idParamSchema, 'params'), validate(driverProfileUpdateSchema, 'body'), adminController.updateAdminDriverHandler);
router.delete('/drivers/:id', validate(idParamSchema, 'params'), adminController.deleteAdminDriverHandler);
router.put('/drivers/:id/subscription', validate(idParamSchema, 'params'), validate(adminSubscriptionSchema, 'body'), adminController.extendSubscriptionHandler);
router.patch('/drivers/:id/subscription', validate(idParamSchema, 'params'), validate(adminSubscriptionSchema, 'body'), adminController.extendSubscriptionHandler);
router.put('/drivers/:id/approve', validate(idParamSchema, 'params'), adminController.approveDriverHandler);
router.patch('/drivers/:id/approve', validate(idParamSchema, 'params'), adminController.approveDriverHandler);
router.put('/drivers/:id/reject', validate(idParamSchema, 'params'), validate(adminReasonSchema, 'body'), adminController.rejectDriverHandler);
router.patch('/drivers/:id/reject', validate(idParamSchema, 'params'), validate(adminReasonSchema, 'body'), adminController.rejectDriverHandler);
router.put('/drivers/:id/block', validate(idParamSchema, 'params'), validate(adminReasonSchema, 'body'), adminController.blockDriverHandler);
router.patch('/drivers/:id/block', validate(idParamSchema, 'params'), validate(adminReasonSchema, 'body'), adminController.blockDriverHandler);
router.put('/drivers/:id/unblock', validate(idParamSchema, 'params'), adminController.unblockDriverHandler);
router.patch('/drivers/:id/unblock', validate(idParamSchema, 'params'), adminController.unblockDriverHandler);
router.post('/drivers/restore', validate(adminRestoreSchema, 'body'), adminController.restoreDriverHandler);
router.get('/history', validate(paginationQuerySchema, 'query'), adminController.getAdminHistoryHandler);
router.get('/pricing', adminController.getPricingHandler);
router.put('/pricing', validate(adminPricingSchema, 'body'), adminController.updatePricingHandler);
router.patch('/pricing', validate(adminPricingSchema, 'body'), adminController.updatePricingHandler);
router.get('/bookings', validate(paginationQuerySchema, 'query'), adminController.getAdminBookingsHandler);

module.exports = router;
