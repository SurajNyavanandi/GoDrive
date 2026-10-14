const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');

/**
 * POST /api/bookings
 * Create new trip booking
 */
router.post('/', (req, res) => {
  try {
    const { driverId, customerName, customerPhone, pickupLocation, tripType, totalFare } = req.body;
    if (!driverId || !customerPhone || !pickupLocation) {
      return res.status(400).json({ success: false, message: 'Driver, Customer Phone, and Pickup Location are required' });
    }

    const booking = storage.createBooking(req.body);
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
