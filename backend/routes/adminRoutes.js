const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');

/**
 * GET /api/admin/drivers
 * Returns all registered drivers with calculated subscription remaining days & status
 */
router.get('/drivers', (req, res) => {
  try {
    const drivers = storage.getAllDriversForAdmin();
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/drivers
 * Admin creates a new driver directly (CRUD Create)
 */
router.post('/drivers', (req, res) => {
  try {
    const driver = storage.createDriverByAdmin(req.body);
    res.status(201).json({ success: true, message: 'Driver created successfully', driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/drivers/:id
 * Admin updates driver details (CRUD Update)
 */
router.put('/drivers/:id', (req, res) => {
  try {
    const updated = storage.updateDriverByAdmin(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver updated successfully', driver: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/drivers/:id/subscription
 * Admin extends driver subscription (e.g. +30 bonus days)
 */
router.put('/drivers/:id/subscription', (req, res) => {
  try {
    const days = Number(req.body.days) || 30;
    const updated = storage.extendSubscription(req.params.id, days);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: `Added ${days} bonus days to ${updated.name}'s subscription`, driver: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver approved with 90-day free trial and is live on homepage', driver: approved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/drivers/:id/reject
 * Admin rejects pending driver application with reason
 */
router.put('/drivers/:id/reject', (req, res) => {
  try {
    const { reason } = req.body;
    const rejected = storage.rejectDriver(req.params.id, reason);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver application rejected. Driver can reapply after 3 days.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/drivers/:id/block
 * Admin permanently blocks driver account with reason
 */
router.put('/drivers/:id/block', (req, res) => {
  try {
    const { reason } = req.body;
    const blocked = storage.blockDriver(req.params.id, reason);
    if (!blocked) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver account has been permanently blocked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/drivers/:id/unblock
 * Admin unblocks driver account (reverses mistaken block)
 */
router.put('/drivers/:id/unblock', (req, res) => {
  try {
    const unblocked = storage.unblockDriver(req.params.id);
    if (!unblocked) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: `Driver account for ${unblocked.name} has been unblocked.`, driver: unblocked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
      return res.status(400).json({ success: false, message: 'Invalid driver snapshot' });
    }
    res.json({ success: true, message: `Driver ${restored.name} restored successfully`, driver: restored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/history
 * Returns chronological admin audit logs
 */
router.get('/history', (req, res) => {
  try {
    const history = storage.getAdminHistory();
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/pricing
 * Admin updates driver duty rates
 */
router.put('/pricing', (req, res) => {
  try {
    const updated = storage.updatePricingSettings(req.body);
    res.json({ success: true, message: 'Pricing rates updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/bookings
 * Returns all customer bookings
 */
router.get('/bookings', (req, res) => {
  try {
    const bookings = storage.getAllBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
