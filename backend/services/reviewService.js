const Review = require('../models/Review');
const { PAGINATION } = require('../config/constants');

/**
 * Retrieves paginated verified customer reviews, optionally filtered by driverId.
 */
async function getReviewsPaged(driverId = null, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const filter = driverId ? { driverId: String(driverId) } : {};

  const total = await Review.countDocuments(filter);
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const data = await Review.find(filter)
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

/**
 * Creates and persists a customer review.
 */
async function createReview(reviewData) {
  const payload = {
    id: `rev-${Date.now()}`,
    ...reviewData,
    rating: Number(reviewData.rating) || 5,
  };
  const doc = await Review.create(payload);
  return doc.toObject ? doc.toObject() : doc;
}

module.exports = {
  getReviewsPaged,
  createReview,
};
