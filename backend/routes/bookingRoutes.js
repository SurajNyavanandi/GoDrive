const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');

/**
 * POST /api/bookings
 * Create new trip booking with edge-case validation
 */
router.post('/', (req, res) => {
  try {
    const rawPickup = req.body.pickupAddress || req.body.pickupLocation;
    const driverId = req.body.driverId;

    if (!driverId || !rawPickup) {
      return res.status(400).json({
        success: false,
        message: 'Driver and Pickup Address are required to schedule a trip.',
      });
    }

    const cleanPickup = String(rawPickup).trim();
    if (cleanPickup.length < 5 || cleanPickup.length > 200 || !/[a-zA-Z]/.test(cleanPickup)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pickup address in Hyderabad (at least 5 characters with street or landmark names).',
      });
    }

    // Format / sanitize phone if provided
    let customerPhone = 'Customer (Web)';
    if (req.body.customerPhone && req.body.customerPhone !== 'Customer (Web)') {
      const digits = String(req.body.customerPhone).replace(/\D/g, '');
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        customerPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
    }

    // Cost validation (reject negative or huge abnormal numbers)
    let totalCost = req.body.totalCost;
    if (totalCost !== undefined && totalCost !== null) {
      const numCost = Number(totalCost);
      if (isNaN(numCost) || numCost < 0 || numCost > 200000) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking cost specified.',
        });
      }
      totalCost = numCost;
    }

    const bookingPayload = {
      ...req.body,
      pickupAddress: cleanPickup,
      customerPhone,
      totalCost,
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
