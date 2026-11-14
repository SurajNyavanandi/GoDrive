const driverService = require('../services/driverService');
const pricingService = require('../services/pricingService');
const bookingService = require('../services/bookingService');
const adminService = require('../services/adminService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { HTTP_STATUS, PAGINATION } = require('../config/constants');

const getAdminDriversHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const result = await driverService.getAllDriversForAdminPaged(page, limit);
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

const createAdminDriverHandler = asyncHandler(async (req, res) => {
  const driver = await driverService.createDriverByAdmin(req.body);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Driver created successfully',
    driver,
  });
});

const updateAdminDriverHandler = asyncHandler(async (req, res) => {
  const updated = await driverService.updateDriverByAdmin(req.params.id, req.body);
  if (!updated) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return successResponse(res, { driver: updated }, 'Driver updated successfully');
});

const deleteAdminDriverHandler = asyncHandler(async (req, res) => {
  const success = await driverService.deleteDriverByAdmin(req.params.id);
  if (!success) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return successResponse(res, null, 'Driver deleted successfully');
});

const extendSubscriptionHandler = asyncHandler(async (req, res) => {
  const days = Number(req.body.days) || 30;
  const updated = await driverService.extendSubscription(req.params.id, days);
  if (!updated) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: `Added ${days} bonus days to ${updated.name}'s subscription`,
    driver: updated,
  });
});

const approveDriverHandler = asyncHandler(async (req, res) => {
  const approved = await driverService.approveDriver(req.params.id);
  if (!approved) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: 'Driver approved with 90-day free trial and is live on homepage',
    driver: approved,
  });
});

const rejectDriverHandler = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const rejected = await driverService.rejectDriver(req.params.id, reason);
  if (!rejected) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: 'Driver application rejected. Driver can reapply after 3 days.',
  });
});

const blockDriverHandler = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const blocked = await driverService.blockDriver(req.params.id, reason);
  if (!blocked) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: 'Driver account has been permanently blocked.',
  });
});

const unblockDriverHandler = asyncHandler(async (req, res) => {
  const unblocked = await driverService.unblockDriver(req.params.id);
  if (!unblocked) {
    return errorResponse(res, 'Driver not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  return res.json({
    success: true,
    message: `Driver account for ${unblocked.name} has been unblocked.`,
    driver: unblocked,
  });
});

const restoreDriverHandler = asyncHandler(async (req, res) => {
  const restored = await driverService.restoreDriver(req.body.driver);
  if (!restored) {
    return errorResponse(res, 'Invalid driver snapshot', HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST');
  }
  return res.json({
    success: true,
    message: `Driver ${restored.name} restored successfully`,
    driver: restored,
  });
});

const getAdminHistoryHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const result = await adminService.getAdminHistoryPaged(page, limit);
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

const getPricingHandler = asyncHandler(async (req, res) => {
  const pricing = await pricingService.getPricingSettings();
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  return successResponse(res, pricing, 'Pricing retrieved successfully');
});

const updatePricingHandler = asyncHandler(async (req, res) => {
  const updated = await pricingService.updatePricingSettings(req.body);
  return res.json({
    success: true,
    message: 'Pricing rates updated successfully',
    data: updated,
  });
});

const getAdminBookingsHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const result = await bookingService.getBookingsPaged({ page, limit });
  return paginatedResponse(res, result.data, result.total, result.page, result.limit);
});

const adminLoginHandler = asyncHandler(async (req, res) => {
  const result = await adminService.authenticateAdmin(req.body);
  return successResponse(res, result, 'Authentication successful');
});

const requestPasswordSetupHandler = asyncHandler(async (req, res) => {
  const result = await adminService.requestAdminPasswordSetup(req.body.email);
  return successResponse(res, result, 'Verification code dispatched');
});

const setPasswordHandler = asyncHandler(async (req, res) => {
  const result = await adminService.setAdminPassword(req.body);
  return successResponse(res, result, 'Password updated successfully');
});

module.exports = {
  getAdminDriversHandler,
  createAdminDriverHandler,
  updateAdminDriverHandler,
  deleteAdminDriverHandler,
  extendSubscriptionHandler,
  approveDriverHandler,
  rejectDriverHandler,
  blockDriverHandler,
  unblockDriverHandler,
  restoreDriverHandler,
  getAdminHistoryHandler,
  getPricingHandler,
  updatePricingHandler,
  getAdminBookingsHandler,
  adminLoginHandler,
  requestPasswordSetupHandler,
  setPasswordHandler,
};
