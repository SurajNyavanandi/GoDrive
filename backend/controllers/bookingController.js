const bookingService = require('../services/bookingService');
const { normalizeMobile } = require('../utils/formatters');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS, PAGINATION } = require('../config/constants');

/**
 * POST /api/bookings
 * Create new trip booking with edge-case validation
 */
const createBookingHandler = asyncHandler(async (req, res) => {
  const rawPickup = req.body.pickupAddress || req.body.pickupLocation;
  const driverId = req.body.driverId;

  if (!driverId || !rawPickup) {
    return errorResponse(res, 'Driver and Pickup Address are required to schedule a trip.', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }

  const cleanPickup = String(rawPickup).trim();
  if (cleanPickup.length < 5 || cleanPickup.length > 250 || !/[a-zA-Z]/.test(cleanPickup)) {
    return errorResponse(
      res,
      'Please provide a valid pickup address in Hyderabad (at least 5 characters with street or landmark names).',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_ADDRESS'
    );
  }

  // Validate & normalize customer phone if provided
  let customerPhone = 'Customer (Web)';
  if (req.body.customerPhone && req.body.customerPhone !== 'Customer (Web)') {
    const normalized = normalizeMobile(req.body.customerPhone);
    if (!normalized || !/^\+91[6-9]\d{9}$/.test(normalized)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
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
      return errorResponse(res, 'Invalid booking cost specified.', HTTP_STATUS.BAD_REQUEST, 'INVALID_COST');
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

  const booking = await bookingService.createBooking(bookingPayload);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Booking confirmed successfully',
    booking,
  });
});

/**
 * GET /api/bookings
 * Get bookings for customer or driver with pagination
 */
const getBookingsHandler = asyncHandler(async (req, res) => {
  const { phone, driverId } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));

  if (!phone && !driverId) {
    return errorResponse(
      res,
      'phone or driverId query parameter is required to retrieve bookings.',
      HTTP_STATUS.BAD_REQUEST,
      'MISSING_QUERY_PARAMETER'
    );
  }

  const result = await bookingService.getBookingsPaged({ phone, driverId, page, limit });
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

module.exports = {
  createBookingHandler,
  getBookingsHandler,
};
