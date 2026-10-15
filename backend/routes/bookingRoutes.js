const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');

/**
 * POST /api/bookings
 * Create new trip booking
 */
router.post('/', (req, res) => {
  try {
    const pickup = req.body.pickupAddress || req.body.pickupLocation;
    const driverId = req.body.driverId;

    if (!driverId || !pickup) {
      return res.status(400).json({
        success: false,
        message: 'Driver and Pickup Address are required to schedule a trip.',
      });
    }

    const bookingPayload = {
      ...req.body,
      pickupAddress: pickup,
      customerPhone: req.body.customerPhone || 'Customer (Web)',
      status: req.body.status || 'Confirmed',
    };

    const booking = storage.createBooking(bookingPayload);
    res.status(201).json({ success: true, message: 'Booking confirmed successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/bookings
 * Get bookings for customer or driver
 */
router.get('/', (req, res) => {
  try {
    const { phone, driverId } = req.query;
    let bookings = storage.getAllBookings();

    if (phone) {
      const clean = storage.cleanPhone(phone);
      bookings = bookings.filter((b) => storage.cleanPhone(b.customerPhone).includes(clean));
    }

    if (driverId) {
      bookings = bookings.filter((b) => b.driverId === driverId);
    }

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
