const Booking = require('../models/Booking');
const { cleanPhone } = require('../utils/formatters');
const { PAGINATION } = require('../config/constants');
const { AppError } = require('../utils/errorHandler');

/**
 * Creates a new trip booking with deduplication guard.
 */
async function createBooking(bookingData) {
  const payload = {
    id: `bk-${Date.now()}`,
    ...bookingData,
    status: bookingData.status || 'Confirmed',
    createdAt: new Date(),
  };

  // Prevent immediate duplicate submissions for the same driver, customer, and address within 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const duplicate = await Booking.findOne({
    driverId: payload.driverId,
    pickupAddress: payload.pickupAddress,
    customerPhone: payload.customerPhone,
    createdAt: { $gte: twoMinutesAgo },
  }).lean();

  if (duplicate) {
    const err = new AppError(
      'A booking for this driver and pickup address was recently submitted. Please wait a moment before booking again.',
      409,
      'DUPLICATE_BOOKING'
    );
    err.field = 'pickupAddress';
    throw err;
  }

  const doc = await Booking.create(payload);
  return doc.toObject ? doc.toObject() : doc;
}

/**
 * Retrieves paginated bookings matching filter criteria directly in MongoDB.
 * Replaces unbounded collection scans with indexed MongoDB queries.
 */
async function getBookingsPaged({ phone, driverId, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT));

  const filter = {};
  if (driverId) {
    filter.driverId = String(driverId);
  }
  if (phone) {
    const digits = cleanPhone(phone);
    if (digits) {
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        filter.customerPhone = {
          $in: [phone.trim(), `+91${last10}`, last10],
        };
      } else {
        filter.customerPhone = { $regex: digits, $options: 'i' };
      }
    }
  }

  const total = await Booking.countDocuments(filter);
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const data = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

module.exports = {
  createBooking,
  getBookingsPaged,
};
