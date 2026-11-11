const express = require('express');
const router = express.Router();
const storage = require('../services/storageService');
const { validate } = require('../middleware/validateMiddleware');
const { bookingCreateSchema, bookingQuerySchema } = require('../middleware/schemas');

/**
 * POST /api/bookings
 * Create new trip booking with edge-case validation
 */
router.post('/', validate(bookingCreateSchema, 'body'), (req, res) => {
  try {
    const rawPickup = req.body.pickupAddress || req.body.pickupLocation;
    const driverId = req.body.driverId;

    if (!driverId || !rawPickup) {
      return res.status(400).json({
        success: false,
        message: 'Driver and Pickup Address are required to schedule a trip.',
        code: 'VALIDATION_ERROR',
      });
    }

    const cleanPickup = String(rawPickup).trim();
    if (cleanPickup.length < 5 || cleanPickup.length > 250 || !/[a-zA-Z]/.test(cleanPickup)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pickup address in Hyderabad (at least 5 characters with street or landmark names).',
        code: 'INVALID_ADDRESS',
      });
    }

    // Validate & normalize customer phone if provided
    let customerPhone = 'Customer (Web)';
    if (req.body.customerPhone && req.body.customerPhone !== 'Customer (Web)') {
      const normalized = storage.normalizeMobile(req.body.customerPhone);
      if (!normalized || !/^\+91[6-9]\d{9}$/.test(normalized)) {
        return res.status(400).json({
          success: false,
          field: 'customerPhone',
          message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
          code: 'INVALID_PHONE',
        });
      }
      customerPhone = normalized;
    }

    // Cost validation (reject negative or abnormal numbers)
    let totalCost = req.body.totalCost;
    if (totalCost !== undefined && totalCost !== null) {
      const numCost = Number(totalCost);
      if (isNaN(numCost) || numCost < 0 || numCost > 200000) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking cost specified.',
          code: 'INVALID_COST',
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
    if (err.statusCode === 409 || err.code === 'DUPLICATE_ENTRY' || err.code === 'DUPLICATE_BOOKING') {
      return res.status(409).json({
        success: false,
        code: err.code || 'DUPLICATE_ENTRY',
        field: err.field,
        message: err.message,
      });
    }
    res.status(500).json({ success: false, message: err.message, code: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/bookings
 * Get bookings for customer or driver with pagination and IDOR restriction
 */
router.get('/', validate(bookingQuerySchema, 'query'), (req, res) => {
  try {
    const { phone, driverId } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    // Prevent open enumeration of all bookings without filter or authorization
    if (!phone && !driverId) {
      return res.status(400).json({
        success: false,
        message: 'phone or driverId query parameter is required to retrieve bookings.',
        code: 'MISSING_QUERY_PARAMETER',
      });
    }

    let filterFn = null;
    if (phone && driverId) {
      const clean = storage.cleanPhone(phone);
      filterFn = (b) => storage.cleanPhone(b.customerPhone).includes(clean) && String(b.driverId) === String(driverId);
    } else if (phone) {
      const clean = storage.cleanPhone(phone);
      filterFn = (b) => storage.cleanPhone(b.customerPhone).includes(clean);
    } else if (driverId) {
      filterFn = (b) => String(b.driverId) === String(driverId);
    }

    const result = storage.getAllBookingsPaged(page, limit, filterFn);

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
