const Driver = require('../models/Driver');
const { recordAdminAction } = require('./adminService');
const { getPricingSettings } = require('./pricingService');
const {
  normalizeMobile,
  formatAadhaar,
  normalizeLicense,
  computeRemainingDays,
} = require('../utils/formatters');
const { DEFAULT_PRICING, PAGINATION } = require('../config/constants');
const { AppError } = require('../utils/errorHandler');

function getStandardPriceForDriverType(driverType, pricing) {
  const p = pricing || DEFAULT_PRICING;
  if (driverType === 'permanent') return Number(p.permanentSubscriptionPrice) || 99;
  if (driverType === 'combined') return Number(p.combinationSubscriptionPrice) || 149;
  return Number(p.freelanceSubscriptionPrice) || 49;
}

function enrichDriverSubscriptionInfo(driver, pricing = null) {
  if (!driver) return null;
  const currentPricing = pricing || DEFAULT_PRICING;
  const remainingDays = computeRemainingDays(driver.subscriptionExpiry);
  let subscriptionStatusText = '';

  if (!driver.isApproved) {
    subscriptionStatusText =
      driver.listingStatus === 'Rejected'
        ? 'Application Rejected'
        : 'Pending Admin Verification';
  } else if (remainingDays > 0) {
    subscriptionStatusText = `+${remainingDays} days left`;
  } else {
    subscriptionStatusText = `${remainingDays} days expired`;
  }

  const constantOtp =
    driver.reviewOtp ||
    (driver.id
      ? String(
          (Math.abs(driver.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) * 17) %
            9000 +
            1000
        )
      : '4821');

  const standardFee = getStandardPriceForDriverType(driver.driverType, currentPricing);
  const lockedSubscriptionFee =
    driver.lockedSubscriptionFee !== undefined && driver.lockedSubscriptionFee !== null
      ? Number(driver.lockedSubscriptionFee)
      : standardFee;

  return {
    ...driver,
    remainingDays,
    subscriptionStatusText,
    reviewOtp: constantOtp,
    lockedSubscriptionFee,
    standardFee,
  };
}

async function getPublicDriversPaged(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT));
  const query = { isApproved: true, status: 'Available' };

  const total = await Driver.countDocuments(query);
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const rawDrivers = await Driver.find(query)
    .select('-reviewOtp -aadhaarNo')
    .sort({ rating: -1, trips: -1, createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  const pricing = await getPricingSettings();
  const data = rawDrivers.map((d) => enrichDriverSubscriptionInfo(d, pricing));

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

async function getAllDriversForAdminPaged(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT));

  const total = await Driver.countDocuments({});
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const rawDrivers = await Driver.find({})
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  const pricing = await getPricingSettings();
  const data = rawDrivers.map((d) => enrichDriverSubscriptionInfo(d, pricing));

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

async function getDriverByPhone(phone) {
  if (!phone) return null;
  const normalized = normalizeMobile(phone);
  const rawDigits = phone.replace(/\D/g, '').slice(-10);

  const driver = await Driver.findOne({
    $or: [{ phone: normalized }, { rawPhone: rawDigits }, { phone: rawDigits }],
  }).lean();

  if (!driver) return null;
  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(driver, pricing);
}

async function getDriverById(id) {
  if (!id) return null;
  const driver = await Driver.findOne({ id }).lean();
  if (!driver) return null;
  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(driver, pricing);
}

async function registerNewDriver(driverData) {
  const normalizedPhone = normalizeMobile(driverData.phone);
  const cleanLicense = normalizeLicense(driverData.licenseNo);
  const formattedAadhaar = formatAadhaar(driverData.aadhaarNo);

  const existing = await Driver.findOne({
    $or: [
      { phone: normalizedPhone },
      { licenseNo: cleanLicense },
      { aadhaarNo: formattedAadhaar },
    ],
  }).lean();

  if (existing) {
    if (existing.phone === normalizedPhone) {
      const err = new AppError('A driver with this mobile number already exists.', 409, 'DUPLICATE_PHONE');
      err.field = 'phone';
      throw err;
    }
    if (existing.licenseNo === cleanLicense) {
      const err = new AppError('A driver with this Driving License already exists.', 409, 'DUPLICATE_LICENSE');
      err.field = 'licenseNo';
      throw err;
    }
    if (existing.aadhaarNo === formattedAadhaar) {
      const err = new AppError('A driver with this Aadhaar number already exists.', 409, 'DUPLICATE_AADHAAR');
      err.field = 'aadhaarNo';
      throw err;
    }
  }

  const payload = {
    id: `drv-${Date.now()}`,
    isApproved: false,
    status: 'Available',
    listingStatus: 'Pending Verification',
    subscriptionPlan: 'free_trial',
    remainingDays: 90,
    subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    reviewOtp: String(Math.floor(1000 + Math.random() * 9000)),
    ...driverData,
    phone: normalizedPhone,
    rawPhone: driverData.phone.replace(/\D/g, '').slice(-10),
    licenseNo: cleanLicense,
    aadhaarNo: formattedAadhaar,
  };

  const doc = await Driver.create(payload);
  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(doc.toObject ? doc.toObject() : doc, pricing);
}

async function createDriverByAdmin(driverData) {
  return registerNewDriver({
    ...driverData,
    isApproved: true,
    listingStatus: 'Verified Driver',
  });
}

async function updateDriverByAdmin(driverId, updateData) {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const cleanUpdate = { ...updateData };
  if (cleanUpdate.phone) cleanUpdate.phone = normalizeMobile(cleanUpdate.phone);
  if (cleanUpdate.licenseNo) cleanUpdate.licenseNo = normalizeLicense(cleanUpdate.licenseNo);
  if (cleanUpdate.aadhaarNo) cleanUpdate.aadhaarNo = formatAadhaar(cleanUpdate.aadhaarNo);

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: cleanUpdate },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (updated) {
    await recordAdminAction('UPDATE_DRIVER', 'DRIVER', driverId, updated.name, { updatedFields: Object.keys(cleanUpdate) }, existing);
  }

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function deleteDriverByAdmin(driverId) {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const deleted = await Driver.findOneAndDelete({ id: driverId }).lean();
  if (deleted) {
    await recordAdminAction('DELETE_DRIVER', 'DRIVER', driverId, existing.name, { deletedDriver: existing }, existing);
    return true;
  }
  return false;
}

async function extendSubscription(driverId, days = 30) {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const now = Date.now();
  const currentExpiry = existing.subscriptionExpiry ? new Date(existing.subscriptionExpiry).getTime() : now;
  const baseTime = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000);

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { subscriptionExpiry: newExpiry, subscriptionPlan: 'featured', isApproved: true, listingStatus: 'Verified Driver' } },
    { returnDocument: 'after' }
  ).lean();

  if (updated) {
    await recordAdminAction('EXTEND_SUBSCRIPTION', 'DRIVER', driverId, updated.name, { bonusDays: days, newExpiry }, existing);
  }

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function approveDriver(driverId) {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { isApproved: true, listingStatus: 'Verified Driver', subscriptionPlan: 'free_trial', subscriptionExpiry: expiry } },
    { returnDocument: 'after' }
  ).lean();

  if (updated) {
    await recordAdminAction('APPROVE_DRIVER', 'DRIVER', driverId, updated.name, { approvedAt: new Date() }, existing);
  }

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function rejectDriver(driverId, reason = '') {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { isApproved: false, listingStatus: 'Rejected', rejectionReason: reason || 'Application details could not be verified' } },
    { returnDocument: 'after' }
  ).lean();

  if (updated) {
    await recordAdminAction('REJECT_DRIVER', 'DRIVER', driverId, existing.name, { reason }, existing);
  }
  return updated;
}

async function blockDriver(driverId, reason = '') {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { isApproved: false, status: 'Blocked', listingStatus: 'Blocked', blockReason: reason || 'Violation of terms of service' } },
    { returnDocument: 'after' }
  ).lean();

  if (updated) {
    await recordAdminAction('BLOCK_DRIVER', 'DRIVER', driverId, existing.name, { reason }, existing);
  }
  return updated;
}

async function unblockDriver(driverId) {
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { isApproved: true, status: 'Available', listingStatus: 'Verified Driver', blockReason: null } },
    { returnDocument: 'after' }
  ).lean();

  if (updated) {
    await recordAdminAction('UNBLOCK_DRIVER', 'DRIVER', driverId, updated.name, {}, existing);
  }

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function restoreDriver(driverSnapshot) {
  if (!driverSnapshot || !driverSnapshot.id) return null;

  const doc = await Driver.findOneAndUpdate(
    { id: driverSnapshot.id },
    { $set: { ...driverSnapshot, isApproved: true, listingStatus: 'Verified Driver' } },
    { returnDocument: 'after', upsert: true }
  ).lean();

  if (doc) {
    await recordAdminAction('RESTORE_DRIVER', 'DRIVER', doc.id, doc.name, { restoredSnapshot: driverSnapshot });
  }

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(doc, pricing);
}

async function updateDriverStatus(driverId, status) {
  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { status } },
    { returnDocument: 'after' }
  ).lean();

  if (!updated) return null;
  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function subscribeDriverPlan(driverId, plan) {
  const now = Date.now();
  const existing = await Driver.findOne({ id: driverId }).lean();
  if (!existing) return null;

  const currentExpiry = existing.subscriptionExpiry ? new Date(existing.subscriptionExpiry).getTime() : now;
  const baseTime = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseTime + 30 * 24 * 60 * 60 * 1000);

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: { subscriptionPlan: plan, subscriptionExpiry: newExpiry, isApproved: true, listingStatus: 'Verified Driver' } },
    { returnDocument: 'after' }
  ).lean();

  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

async function updateDriverSelfProfile(driverId, profileData) {
  const cleanUpdate = { ...profileData };
  delete cleanUpdate.isApproved;
  delete cleanUpdate.subscriptionPlan;
  delete cleanUpdate.subscriptionExpiry;
  delete cleanUpdate.id;

  if (cleanUpdate.phone) cleanUpdate.phone = normalizeMobile(cleanUpdate.phone);
  if (cleanUpdate.licenseNo) cleanUpdate.licenseNo = normalizeLicense(cleanUpdate.licenseNo);
  if (cleanUpdate.aadhaarNo) cleanUpdate.aadhaarNo = formatAadhaar(cleanUpdate.aadhaarNo);

  const updated = await Driver.findOneAndUpdate(
    { id: driverId },
    { $set: cleanUpdate },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!updated) return null;
  const pricing = await getPricingSettings();
  return enrichDriverSubscriptionInfo(updated, pricing);
}

module.exports = {
  enrichDriverSubscriptionInfo,
  getPublicDriversPaged,
  getAllDriversForAdminPaged,
  getDriverByPhone,
  getDriverById,
  registerNewDriver,
  createDriverByAdmin,
  updateDriverByAdmin,
  deleteDriverByAdmin,
  extendSubscription,
  approveDriver,
  rejectDriver,
  blockDriver,
  unblockDriver,
  restoreDriver,
  updateDriverStatus,
  subscribeDriverPlan,
  updateDriverSelfProfile,
};
