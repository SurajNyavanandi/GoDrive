const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');
const { protectAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  driverRegisterSchema,
  driverProfileUpdateSchema,
  adminSubscriptionSchema,
  adminReasonSchema,
  adminPricingSchema,
  paginationQuerySchema,
} = require('../middleware/schemas');

// Enforce server-side Admin Authentication for all admin routes
router.use(protectAdmin);

/**
 * GET /api/admin/drivers
 * Returns all registered drivers with pagination
 */
router.get('/drivers', validate(paginationQuerySchema, 'query'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = storage.getAllDriversForAdminPaged(page, limit);
    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/admin/drivers
 * Admin creates a new driver directly (CRUD Create)
 */
router.post('/drivers', validate(driverRegisterSchema, 'body'), (req, res) => {
  try {
    const driver = storage.createDriverByAdmin(req.body);
    res.status(201).json({ success: true, message: 'Driver created successfully', driver });
  } catch (err) {
    if (err.statusCode === 409 || err.code === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_ENTRY',
        field: err.field,
        message: err.message,
      });
    }
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id
 * Admin updates driver details (CRUD Update)
 */
router.put('/drivers/:id', validate(driverProfileUpdateSchema, 'body'), (req, res) => {
  try {
    const updated = storage.updateDriverByAdmin(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Driver updated successfully', driver: updated });
  } catch (err) {
    if (err.statusCode === 409 || err.code === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_ENTRY',
        field: err.field,
        message: err.message,
      });
    }
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * DELETE /api/admin/drivers/:id
 * Admin deletes driver (CRUD Delete)
 */
router.delete('/drivers/:id', (req, res) => {
  try {
    const success = storage.deleteDriverByAdmin(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id/subscription
 * Admin extends driver subscription
 */
router.put('/drivers/:id/subscription', validate(adminSubscriptionSchema, 'body'), (req, res) => {
  try {
    const days = Number(req.body.days) || 30;
    const updated = storage.extendSubscription(req.params.id, days);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: `Added ${days} bonus days to ${updated.name}'s subscription`, driver: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id/approve
 * Admin approves pending driver application
 */
router.put('/drivers/:id/approve', (req, res) => {
  try {
    const approved = storage.approveDriver(req.params.id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Driver approved with 90-day free trial and is live on homepage', driver: approved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id/reject
 * Admin rejects pending driver application with reason
 */
router.put('/drivers/:id/reject', validate(adminReasonSchema, 'body'), (req, res) => {
  try {
    const { reason } = req.body;
    const rejected = storage.rejectDriver(req.params.id, reason);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Driver application rejected. Driver can reapply after 3 days.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id/block
 * Admin permanently blocks driver account with reason
 */
router.put('/drivers/:id/block', validate(adminReasonSchema, 'body'), (req, res) => {
  try {
    const { reason } = req.body;
    const blocked = storage.blockDriver(req.params.id, reason);
    if (!blocked) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: 'Driver account has been permanently blocked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/drivers/:id/unblock
 * Admin unblocks driver account
 */
router.put('/drivers/:id/unblock', (req, res) => {
  try {
    const unblocked = storage.unblockDriver(req.params.id);
    if (!unblocked) {
      return res.status(404).json({ success: false, message: 'Driver not found', code: 'NOT_FOUND' });
    }
    res.json({ success: true, message: `Driver account for ${unblocked.name} has been unblocked.`, driver: unblocked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/admin/drivers/restore
 * Admin restores a deleted driver from history snapshot
 */
router.post('/drivers/restore', (req, res) => {
  try {
    const restored = storage.restoreDriver(req.body.driver);
    if (!restored) {
      return res.status(400).json({ success: false, message: 'Invalid driver snapshot', code: 'BAD_REQUEST' });
    }
    res.json({ success: true, message: `Driver ${restored.name} restored successfully`, driver: restored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/admin/history
 * Returns chronological admin audit logs with pagination
 */
router.get('/history', validate(paginationQuerySchema, 'query'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = storage.getAdminHistoryPaged(page, limit);
    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/admin/pricing
 * Retrieve current dynamic driver duty rates
 */
router.get('/pricing', (req, res) => {
  try {
    const pricing = storage.getPricingSettings();
    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/pricing
 * Admin updates driver duty rates
 */
router.put('/pricing', validate(adminPricingSchema, 'body'), (req, res) => {
  try {
    const updated = storage.updatePricingSettings(req.body);
    res.json({ success: true, message: 'Pricing rates updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/admin/bookings
 * Returns all customer bookings with pagination
 */
router.get('/bookings', validate(paginationQuerySchema, 'query'), (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = storage.getAllBookingsPaged(page, limit);
    res.json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
