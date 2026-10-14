const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');

/**
 * GET /api/admin/drivers
 * Returns all registered drivers (Pending and Approved)
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
 * PUT /api/admin/drivers/:id/approve
 * Admin approves driver application
 */
router.put('/drivers/:id/approve', (req, res) => {
  try {
    const approved = storage.approveDriver(req.params.id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver approved successfully and is now live on homepage', driver: approved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/drivers/:id
 * Admin rejects driver application
 */
router.delete('/drivers/:id', (req, res) => {
  try {
    const success = storage.rejectDriver(req.params.id);
    res.json({ success: true, message: 'Driver application rejected' });
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
