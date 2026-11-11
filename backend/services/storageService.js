const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to compute remaining days from ISO string
function computeRemainingDays(expiryIso) {
  if (!expiryIso) return 0;
  const expiryTime = new Date(expiryIso).getTime();
  if (isNaN(expiryTime)) return 0;
  const now = Date.now();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

const defaultPricing = {
  freelanceSubscriptionPrice: 49,
  permanentSubscriptionPrice: 99,
  combinationSubscriptionPrice: 149,
  cityBaseHours: 4,
  cityBaseFare: 700,
  cityExtraHourlyRate: 100,
  nightSurchargePerHour: 150,
  outstationFlatRate: 2000,
  outstationInterstateRate: 2500,
  monthly4hMinSalary: 20000,
  monthly4hMaxSalary: 25000,
  monthly8hMinSalary: 25000,
  monthly8hMaxSalary: 30000,
  monthly12hMinSalary: 30000,
  monthly12hMaxSalary: 40000,
};

let cachedDB = null;
let dbOperationLock = false;

class DuplicateConstraintError extends Error {
  constructor(message, field, code = 'DUPLICATE_KEY') {
    super(message);
    this.name = 'DuplicateConstraintError';
    this.status = 409;
    this.statusCode = 409;
    this.field = field;
    this.code = code;
  }
}

/**
 * Normalizes an Indian mobile number into consistent +91XXXXXXXXXX format.
 * Strips spaces, dashes, brackets, leading zeroes, and country code prefixes.
 * "98765 43210", "+91 98765-43210", "09876543210", "+919876543210" all count as "+919876543210".
 */
const normalizeMobile = (phone) => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? `+91${digits}` : (digits ? `+91${digits}` : '');
};

const normalizeAadhaar = (aadhaar) => {
  if (!aadhaar) return '';
  return String(aadhaar).replace(/\D/g, '');
};

const formatAadhaar = (aadhaar) => {
  const clean = normalizeAadhaar(aadhaar);
  if (clean.length === 12) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
  }
  return aadhaar || '';
};

const normalizeLicense = (license) => {
  if (!license) return '';
  return String(license).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

function initDB() {
  if (cachedDB) {
    return cachedDB;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const emptyData = {
    drivers: [],
    bookings: [],
    pricingSettings: defaultPricing,
    reviews: [],
    adminHistory: [],
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    cachedDB = emptyData;
    return emptyData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    let modified = false;

    if (!data.drivers || !Array.isArray(data.drivers)) {
      data.drivers = [];
      modified = true;
    }

    if (!data.bookings || !Array.isArray(data.bookings)) {
      data.bookings = [];
      modified = true;
    }

    if (!data.pricingSettings) {
      data.pricingSettings = defaultPricing;
      modified = true;
    }

    if (!data.reviews || !Array.isArray(data.reviews)) {
      data.reviews = [];
      modified = true;
    }

    if (!data.adminHistory || !Array.isArray(data.adminHistory)) {
      data.adminHistory = [];
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

    cachedDB = data;
    return data;
  } catch (err) {
    logger.error('Failed to read db.json, re-initializing empty database', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    cachedDB = emptyData;
    return emptyData;
  }
}

function saveDB(data, action = 'SAVE_DB') {
  cachedDB = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    logger.db(action, {
      driverCount: data.drivers ? data.drivers.length : 0,
      bookingCount: data.bookings ? data.bookings.length : 0,
      historyCount: data.adminHistory ? data.adminHistory.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`Error saving db.json during ${action}`, err);
  }
}

// Helpers
const cleanPhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');

/**
 * Calculates current price for a driver's plan based on driverType and pricingSettings
 */
const getStandardPriceForDriverType = (driverType, pricingSettings) => {
  const p = pricingSettings || defaultPricing;
  if (driverType === 'permanent') return Number(p.permanentSubscriptionPrice) || 99;
  if (driverType === 'combined') return Number(p.combinationSubscriptionPrice) || 149;
  return Number(p.freelanceSubscriptionPrice) || 49;
};

/**
 * Audit / History Logger: records any administrative change to db.json
 */
function recordAdminAction(actionType, targetType, targetId, targetName, details = {}, previousState = null) {
  try {
    const db = initDB();
    if (!db.adminHistory) db.adminHistory = [];
    const logEntry = {
      id: `hist-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      actionType, // 'APPROVE_DRIVER' | 'REJECT_DRIVER' | 'BLOCK_DRIVER' | 'UNBLOCK_DRIVER' | 'DELETE_DRIVER' | 'RESTORE_DRIVER' | 'UPDATE_DRIVER' | 'CREATE_DRIVER' | 'EXTEND_SUBSCRIPTION' | 'UPDATE_PRICING'
      targetType, // 'DRIVER' | 'PRICING' | 'BOOKING'
      targetId: String(targetId || ''),
      targetName: String(targetName || ''),
      details,
      previousState,
    };
    db.adminHistory.unshift(logEntry);
    if (db.adminHistory.length > 500) {
      db.adminHistory = db.adminHistory.slice(0, 500);
    }
    saveDB(db, `AUDIT_${actionType}`);
    return logEntry;
  } catch (err) {
    logger.error('Failed to record admin history log:', err);
    return null;
  }
}

const getAdminHistory = () => {
  const db = initDB();
  return db.adminHistory || [];
};

/**
 * Enriches driver object with computed subscription info and grandfathered price
 */
const enrichDriverSubscriptionInfo = (driver, pricing = null) => {
  const currentPricing = pricing || (cachedDB && cachedDB.pricingSettings) || defaultPricing;
  const remainingDays = computeRemainingDays(driver.subscriptionExpiry);
  let subscriptionStatusText = '';
  
  if (!driver.isApproved) {
    subscriptionStatusText = driver.listingStatus === 'Rejected' ? 'Application Rejected' : 'Pending Admin Verification';
  } else if (remainingDays > 0) {
    subscriptionStatusText = `+${remainingDays} days left`;
  } else {
    subscriptionStatusText = `${remainingDays} days expired`;
  }

  const constantOtp = driver.reviewOtp || (driver.id ? String((Math.abs(driver.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) * 17) % 9000 + 1000) : '4821');

  // Grandfathering: If driver already has a lockedSubscriptionFee, keep it.
  // Otherwise default to the standard price for their driver type.
  const standardFee = getStandardPriceForDriverType(driver.driverType, currentPricing);
  const lockedSubscriptionFee = driver.lockedSubscriptionFee !== undefined && driver.lockedSubscriptionFee !== null
    ? Number(driver.lockedSubscriptionFee)
    : standardFee;

  return {
    ...driver,
    remainingDays,
    subscriptionStatusText,
    reviewOtp: constantOtp,
    lockedSubscriptionFee,
    renewalPrice: lockedSubscriptionFee,
    isTrial: driver.subscriptionPlan === 'free_trial',
    isExpired: driver.isApproved && remainingDays <= 0,
    phoneMasked: driver.phone ? driver.phone.replace(/(\d{3})\d{5}(\d{2})/, '$1 ***** $2') : '+91 98490 *****',
    premiumActivatedAt: driver.premiumActivatedAt || driver.createdAt || new Date().toISOString(),
  };
};

/**
 * Public Homepage Drivers:
 * - Must be approved (`isApproved !== false`)
 * - Must have active subscription or trial (`remainingDays > 0`)
 */
const getPublicDrivers = () => {
  const db = initDB();
  const pricing = db.pricingSettings || defaultPricing;
  return db.drivers
    .map((d) => enrichDriverSubscriptionInfo(d, pricing))
    .filter((d) => d.isApproved && d.remainingDays > 0)
    .sort((a, b) => {
      if (a.subscriptionPlan === 'featured' && b.subscriptionPlan !== 'featured') return -1;
      if (b.subscriptionPlan === 'featured' && a.subscriptionPlan !== 'featured') return 1;
      return 0;
    });
};

const getAllDriversForAdmin = () => {
  const db = initDB();
  const pricing = db.pricingSettings || defaultPricing;
  return db.drivers.map((d) => enrichDriverSubscriptionInfo(d, pricing));
};

function checkDriverUniqueness(db, driverData, excludeDriverId = null) {
  const normPhone = normalizeMobile(driverData.phone || driverData.rawPhone);
  const normAadhaar = normalizeAadhaar(driverData.aadhaarNo);
  const normLicense = normalizeLicense(driverData.licenseNo);

  for (const d of db.drivers) {
    if (excludeDriverId && d.id === excludeDriverId) continue;

    // Check duplicate mobile
    if (normPhone && normPhone.length === 13) {
      const existingPhone = normalizeMobile(d.phone || d.rawPhone);
      if (existingPhone === normPhone) {
        throw new DuplicateConstraintError(
          'This mobile number is already registered.',
          'phone',
          'DUPLICATE_MOBILE'
        );
      }
    }

    // Check duplicate Aadhaar card
    if (normAadhaar && normAadhaar.length === 12) {
      const existingAadhaar = normalizeAadhaar(d.aadhaarNo);
      if (existingAadhaar === normAadhaar) {
        throw new DuplicateConstraintError(
          'This Aadhaar card number is already registered.',
          'aadhaarNo',
          'DUPLICATE_CARD'
        );
      }
    }

    // Check duplicate Driving License
    if (normLicense && normLicense.length >= 8) {
      const existingLicense = normalizeLicense(d.licenseNo);
      if (existingLicense === normLicense) {
        throw new DuplicateConstraintError(
          'This driving license is already registered.',
          'licenseNo',
          'DUPLICATE_LICENSE'
        );
      }
    }
  }
}

const getDriverByPhone = (phone) => {
  const raw = normalizeMobile(phone);
  const digits = raw.replace(/\D/g, '');
  const db = initDB();
  const driver = db.drivers.find(
    (d) => normalizeMobile(d.rawPhone || d.phone) === raw || (digits.length >= 10 && normalizeMobile(d.phone).endsWith(digits.slice(-10)))
  );
  return driver ? enrichDriverSubscriptionInfo(driver) : null;
};

const registerNewDriver = (driverData) => {
  const db = initDB();
  const currentPricing = db.pricingSettings || defaultPricing;
  const rawMobile = normalizeMobile(driverData.phone || driverData.rawPhone);
  const cleanLicense = normalizeLicense(driverData.licenseNo);
  const cleanAadhaar = normalizeAadhaar(driverData.aadhaarNo);
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Check if driver with phone already exists
  const existingIndex = db.drivers.findIndex((d) => normalizeMobile(d.rawPhone || d.phone) === rawMobile);
  const existingDriver = existingIndex !== -1 ? db.drivers[existingIndex] : null;

  if (existingDriver && existingDriver.isApproved) {
    return {
      success: false,
      status: 409,
      code: 'DUPLICATE_MOBILE',
      field: 'phone',
      message: 'This mobile number is already registered.',
    };
  }

  // Enforce uniqueness across all other drivers
  try {
    checkDriverUniqueness(db, driverData, existingDriver ? existingDriver.id : null);
  } catch (err) {
    if (err instanceof DuplicateConstraintError) {
      return {
        success: false,
        status: 409,
        code: err.code,
        field: err.field,
        message: err.message,
      };
    }
    throw err;
  }

  if (existingDriver) {
    // Check 3-day cooldown if rejected
    if (existingDriver.listingStatus === 'Rejected') {
      const reapplyTime = existingDriver.reapplyAllowedAt ? new Date(existingDriver.reapplyAllowedAt).getTime() : 0;
      if (reapplyTime > now) {
        const daysLeft = Math.ceil((reapplyTime - now) / DAY_MS);
        return {
          success: false,
          code: 'REAPPLY_COOLDOWN',
          reapplyAllowedAt: existingDriver.reapplyAllowedAt,
          message: `Application was rejected (${existingDriver.rejectionReason || 'Document verification failed'}). You can re-apply in ${daysLeft} day${daysLeft > 1 ? 's' : ''} on ${new Date(reapplyTime).toLocaleDateString('en-IN')}.`,
        };
      }
    }

    const lockedFee = existingDriver.lockedSubscriptionFee !== undefined
      ? existingDriver.lockedSubscriptionFee
      : getStandardPriceForDriverType(driverData.driverType || existingDriver.driverType, currentPricing);

    db.drivers[existingIndex] = {
      ...existingDriver,
      name: driverData.name || existingDriver.name,
      driverType: driverData.driverType || 'freelance',
      hourlyRate: Number(driverData.hourlyRate) || 180,
      monthlySalary: driverData.monthlySalary ? Number(driverData.monthlySalary) : existingDriver.monthlySalary,
      phone: rawMobile,
      rawPhone: rawMobile.replace(/\D/g, ''),
      location: driverData.location || existingDriver.location,
      experience: Number(driverData.experience) || existingDriver.experience,
      languages: driverData.languages || existingDriver.languages,
      bio: driverData.bio || existingDriver.bio,
      licenseNo: cleanLicense,
      licensePhoto: driverData.licensePhoto || existingDriver.licensePhoto,
      aadhaarNo: formatAadhaar(cleanAadhaar),
      aadhaarPhoto: driverData.aadhaarPhoto || existingDriver.aadhaarPhoto,
      workingPreference: driverData.workingPreference || existingDriver.workingPreference,
      photo: driverData.photo || existingDriver.photo,
      reviewOtp: existingDriver.reviewOtp || String(Math.floor(1000 + Math.random() * 9000)),
      lockedSubscriptionFee: lockedFee,
      isApproved: false,
      status: 'Available',
      listingStatus: 'Pending Admin Verification',
      rejectionReason: null,
      rejectedAt: null,
      reapplyAllowedAt: null,
      subscriptionPlan: 'free_trial',
      premiumActivatedAt: new Date().toISOString(),
      subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDB(db, 'REGISTER_DRIVER_UPDATE');
    return { success: true, driver: enrichDriverSubscriptionInfo(db.drivers[existingIndex]), updated: true };
  }

  const reviewOtp = String(Math.floor(1000 + Math.random() * 9000));
  const initialLockedFee = getStandardPriceForDriverType(driverData.driverType || 'freelance', currentPricing);

  const newDriver = {
    id: `drv-${Date.now()}`,
    name: driverData.name,
    driverType: driverData.driverType || 'freelance',
    vehicle: driverData.vehicle || 'Manual & Automatic Cars',
    rating: 5.0,
    trips: 0,
    hourlyRate: Number(driverData.hourlyRate) || 180,
    monthlySalary: driverData.monthlySalary ? Number(driverData.monthlySalary) : 25000,
    location: driverData.location || 'Hyderabad',
    status: 'Available',
    languages: driverData.languages || 'Telugu, Hindi, English',
    experience: Number(driverData.experience) || 3,
    phone: rawMobile,
    rawPhone: rawMobile.replace(/\D/g, ''),
    photo: driverData.photo || driverData.photoPreview || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D',
    bio: driverData.bio || 'Verified Hyderabad driver.',
    licenseNo: cleanLicense,
    licensePhoto: driverData.licensePhoto,
    aadhaarNo: formatAadhaar(cleanAadhaar),
    aadhaarPhoto: driverData.aadhaarPhoto,
    workingPreference: driverData.workingPreference,
    reviewOtp,
    lockedSubscriptionFee: initialLockedFee,
    isApproved: false,
    listingStatus: 'Pending Admin Verification',
    subscriptionPlan: 'free_trial',
    premiumActivatedAt: new Date().toISOString(),
    subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.drivers.unshift(newDriver);
  saveDB(db, 'REGISTER_DRIVER_NEW');

  return { success: true, driver: enrichDriverSubscriptionInfo(newDriver) };
};

/**
 * Admin direct driver creation (CRUD)
 */
const createDriverByAdmin = (driverData) => {
  const db = initDB();
  const currentPricing = db.pricingSettings || defaultPricing;
  const rawMobile = normalizeMobile(driverData.phone || driverData.rawPhone);
  const cleanLicense = normalizeLicense(driverData.licenseNo);
  const cleanAadhaar = normalizeAadhaar(driverData.aadhaarNo);
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  try {
    checkDriverUniqueness(db, driverData);
  } catch (err) {
    if (err instanceof DuplicateConstraintError) {
      return { success: false, status: 409, code: err.code, field: err.field, message: err.message };
    }
    throw err;
  }

  const lockedFee = getStandardPriceForDriverType(driverData.driverType || 'freelance', currentPricing);

  const newDriver = {
    id: `drv-admin-${Date.now()}`,
    name: driverData.name || 'New Driver',
    phone: rawMobile,
    rawPhone: rawMobile ? rawMobile.replace(/\D/g, '') : '',
    driverType: driverData.driverType || 'freelance',
    hourlyRate: Number(driverData.hourlyRate) || 180,
    monthlySalary: driverData.monthlySalary ? Number(driverData.monthlySalary) : null,
    location: driverData.location || 'Hitec City',
    experience: Number(driverData.experience) || 3,
    rating: 5.0,
    trips: 0,
    status: driverData.status || 'Available',
    languages: driverData.languages || 'Telugu, Hindi',
    photo: driverData.photo || driverData.photoPreview || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D',
    bio: driverData.bio || 'Verified driver created by admin.',
    licenseNo: cleanLicense || 'TS09-2023-0000000',
    aadhaarNo: formatAadhaar(cleanAadhaar) || '0000-0000-0000',
    licensePhoto: driverData.licensePhoto || null,
    aadhaarPhoto: driverData.aadhaarPhoto || null,
    isApproved: true,
    listingStatus: driverData.subscriptionPlan === 'featured' ? 'Featured Chauffeur' : 'Verified Driver',
    subscriptionPlan: driverData.subscriptionPlan || 'free_trial',
    reviewOtp: driverData.reviewOtp || String(Math.floor(1000 + Math.random() * 9000)),
    lockedSubscriptionFee: lockedFee,
    subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.drivers.unshift(newDriver);
  saveDB(db, 'CREATE_DRIVER_ADMIN');
  recordAdminAction('CREATE_DRIVER', 'DRIVER', newDriver.id, newDriver.name, {
    driverType: newDriver.driverType,
    location: newDriver.location,
    phone: newDriver.phone,
    lockedSubscriptionFee: lockedFee,
  });
  return { success: true, driver: enrichDriverSubscriptionInfo(newDriver) };
};

/**
 * Admin update driver (CRUD)
 */
const updateDriverByAdmin = (id, updateData) => {
  const db = initDB();
  const index = db.drivers.findIndex((d) => d.id === id);
  if (index === -1) return null;

  try {
    checkDriverUniqueness(db, updateData, id);
  } catch (err) {
    if (err instanceof DuplicateConstraintError) {
      return { success: false, status: 409, code: err.code, field: err.field, message: err.message };
    }
    throw err;
  }

  const existing = db.drivers[index];
  const rawMobile = updateData.phone ? normalizeMobile(updateData.phone) : existing.phone;
  const cleanAadhaar = updateData.aadhaarNo ? formatAadhaar(updateData.aadhaarNo) : existing.aadhaarNo;
  const cleanLicense = updateData.licenseNo ? normalizeLicense(updateData.licenseNo) : existing.licenseNo;

  const updated = {
    ...existing,
    ...updateData,
    phone: rawMobile,
    rawPhone: rawMobile ? rawMobile.replace(/\D/g, '') : existing.rawPhone,
    aadhaarNo: cleanAadhaar,
    licenseNo: cleanLicense,
    hourlyRate: updateData.hourlyRate !== undefined ? Number(updateData.hourlyRate) : existing.hourlyRate,
    monthlySalary: updateData.monthlySalary !== undefined ? (updateData.monthlySalary ? Number(updateData.monthlySalary) : null) : existing.monthlySalary,
    experience: updateData.experience !== undefined ? Number(updateData.experience) : existing.experience,
    updatedAt: new Date().toISOString(),
  };

  db.drivers[index] = updated;
  saveDB(db, 'UPDATE_DRIVER_ADMIN');
  recordAdminAction('UPDATE_DRIVER', 'DRIVER', id, updated.name, {
    changes: updateData,
  }, {
    name: existing.name,
    driverType: existing.driverType,
    hourlyRate: existing.hourlyRate,
    location: existing.location,
    phone: existing.phone,
    subscriptionPlan: existing.subscriptionPlan,
  });
  return { success: true, driver: enrichDriverSubscriptionInfo(updated) };
};

/**
 * Admin delete driver (CRUD) - captures snapshot for history & undo
 */
const deleteDriverByAdmin = (id) => {
  const db = initDB();
  const driverToDelete = db.drivers.find((d) => d.id === id);
  if (!driverToDelete) return false;

  const initialCount = db.drivers.length;
  db.drivers = db.drivers.filter((d) => d.id !== id);
  saveDB(db);

  recordAdminAction('DELETE_DRIVER', 'DRIVER', id, driverToDelete.name, {
    deletedAt: new Date().toISOString(),
    snapshot: driverToDelete, // Keep full snapshot so admin can view/restore if deleted by mistake
  });

  return db.drivers.length < initialCount;
};

/**
 * Admin unblock driver (reverses accidental or temporary block)
 */
const unblockDriver = (id) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const previous = { status: driver.status, isApproved: driver.isApproved, listingStatus: driver.listingStatus, blockReason: driver.blockReason };

  driver.status = 'Available';
  driver.isApproved = true;
  driver.listingStatus = driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver';
  delete driver.blockReason;
  delete driver.blockedAt;

  saveDB(db);
  recordAdminAction('UNBLOCK_DRIVER', 'DRIVER', id, driver.name, {
    unblockedAt: new Date().toISOString(),
  }, previous);

  return enrichDriverSubscriptionInfo(driver);
};

/**
 * Admin restore driver (undo mistaken deletion)
 */
const restoreDriver = (driverSnapshot) => {
  if (!driverSnapshot || !driverSnapshot.id) return null;
  const db = initDB();
  const existing = db.drivers.find((d) => d.id === driverSnapshot.id);
  if (existing) {
    return enrichDriverSubscriptionInfo(existing);
  }

  db.drivers.unshift(driverSnapshot);
  saveDB(db);
  recordAdminAction('RESTORE_DRIVER', 'DRIVER', driverSnapshot.id, driverSnapshot.name, {
    restoredAt: new Date().toISOString(),
  });

  return enrichDriverSubscriptionInfo(driverSnapshot);
};

/**
 * Admin extend driver subscription (e.g. +30 days)
 */
const extendSubscription = (id, extraDays = 30) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const DAY_MS = 24 * 60 * 60 * 1000;
  const currentExpiry = new Date(driver.subscriptionExpiry).getTime();
  const now = Date.now();
  const baseTime = !isNaN(currentExpiry) && currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseTime + extraDays * DAY_MS).toISOString();

  const prevExpiry = driver.subscriptionExpiry;
  driver.subscriptionExpiry = newExpiry;
  if (!driver.subscriptionPlan || driver.subscriptionPlan === 'none') {
    driver.subscriptionPlan = 'starter';
  }
  driver.listingStatus = driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver';
  saveDB(db);

  recordAdminAction('EXTEND_SUBSCRIPTION', 'DRIVER', id, driver.name, {
    extraDays,
    newExpiry,
    prevExpiry,
  });

  return enrichDriverSubscriptionInfo(driver);
};

/**
 * Driver self subscription payment - uses grandfathered lockedSubscriptionFee
 */
const subscribeDriverPlan = (id, plan = 'starter') => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const currentPricing = db.pricingSettings || defaultPricing;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const currentExpiry = new Date(driver.subscriptionExpiry).getTime();
  const now = Date.now();
  const baseTime = !isNaN(currentExpiry) && currentExpiry > now ? currentExpiry : now;

  // Use grandfathered fee if present
  const paidFee = driver.lockedSubscriptionFee !== undefined
    ? driver.lockedSubscriptionFee
    : getStandardPriceForDriverType(driver.driverType, currentPricing);
  
  driver.subscriptionPlan = plan;
  driver.subscriptionExpiry = new Date(baseTime + 30 * DAY_MS).toISOString();
  driver.isApproved = true;
  driver.premiumActivatedAt = new Date().toISOString();
  driver.listingStatus = plan === 'featured' ? 'Featured Chauffeur' : (driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver');
  driver.lastPaymentAmount = paidFee;
  
  saveDB(db);
  return enrichDriverSubscriptionInfo(driver);
};

const updateDriverSelfProfile = (id, profileData) => {
  const db = initDB();
  const index = db.drivers.findIndex((d) => d.id === id);
  if (index === -1) return null;

  try {
    checkDriverUniqueness(db, profileData, id);
  } catch (err) {
    if (err instanceof DuplicateConstraintError) {
      return { success: false, status: 409, code: err.code, field: err.field, message: err.message };
    }
    throw err;
  }

  const existing = db.drivers[index];
  const rawMobile = profileData.phone ? normalizeMobile(profileData.phone) : existing.phone;
  const cleanAadhaar = profileData.aadhaarNo ? formatAadhaar(profileData.aadhaarNo) : existing.aadhaarNo;
  const cleanLicense = profileData.licenseNo ? normalizeLicense(profileData.licenseNo) : existing.licenseNo;

  const updated = {
    ...existing,
    name: profileData.name || existing.name,
    phone: rawMobile,
    rawPhone: rawMobile ? rawMobile.replace(/\D/g, '') : existing.rawPhone,
    aadhaarNo: cleanAadhaar,
    licenseNo: cleanLicense,
    driverType: profileData.driverType || existing.driverType,
    hourlyRate: profileData.hourlyRate ? Number(profileData.hourlyRate) : existing.hourlyRate,
    monthlySalary: profileData.monthlySalary ? Number(profileData.monthlySalary) : existing.monthlySalary,
    location: profileData.location || existing.location,
    languages: profileData.languages || existing.languages,
    bio: profileData.bio || existing.bio,
    photo: profileData.photo || existing.photo,
    updatedAt: new Date().toISOString(),
  };

  db.drivers[index] = updated;
  saveDB(db, 'UPDATE_DRIVER_SELF_PROFILE');
  return { success: true, driver: enrichDriverSubscriptionInfo(updated) };
};

const updateDriverStatus = (id, status) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const prevStatus = driver.status;
  driver.status = status;
  saveDB(db);
  recordAdminAction('UPDATE_STATUS', 'DRIVER', id, driver.name, {
    newStatus: status,
    prevStatus,
  });
  return enrichDriverSubscriptionInfo(driver);
};

const approveDriver = (id) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  driver.isApproved = true;
  driver.premiumActivatedAt = new Date().toISOString();
  // Grant 3-month (90 days) free trial if expiry is not set or passed
  if (!driver.subscriptionExpiry || computeRemainingDays(driver.subscriptionExpiry) <= 0) {
    driver.subscriptionPlan = 'free_trial';
    driver.subscriptionExpiry = new Date(now + 90 * DAY_MS).toISOString();
  }

  driver.listingStatus = driver.subscriptionPlan === 'featured' ? 'Featured Chauffeur' : (driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver');
  saveDB(db);

  recordAdminAction('APPROVE_DRIVER', 'DRIVER', id, driver.name, {
    approvedAt: new Date().toISOString(),
    subscriptionExpiry: driver.subscriptionExpiry,
  });

  return enrichDriverSubscriptionInfo(driver);
};

const rejectDriver = (id, reason = 'Application details verification incomplete') => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return false;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  driver.isApproved = false;
  driver.listingStatus = 'Rejected';
  driver.rejectionReason = reason;
  driver.rejectedAt = new Date(now).toISOString();
  driver.reapplyAllowedAt = new Date(now + 3 * DAY_MS).toISOString(); // Reapply allowed after 3 days

  saveDB(db);

  recordAdminAction('REJECT_DRIVER', 'DRIVER', id, driver.name, {
    reason,
    rejectedAt: driver.rejectedAt,
    reapplyAllowedAt: driver.reapplyAllowedAt,
  });

  return true;
};

const blockDriver = (id, reason = 'Blocked due to policy violations') => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return false;

  const previous = { status: driver.status, isApproved: driver.isApproved, listingStatus: driver.listingStatus };

  driver.isApproved = false;
  driver.status = 'Blocked';
  driver.listingStatus = 'Blocked';
  driver.blockReason = reason;
  driver.blockedAt = new Date().toISOString();

  saveDB(db);

  recordAdminAction('BLOCK_DRIVER', 'DRIVER', id, driver.name, {
    reason,
    blockedAt: driver.blockedAt,
  }, previous);

  return true;
};

const getPricingSettings = () => {
  const db = initDB();
  return db.pricingSettings || defaultPricing;
};

const updatePricingSettings = (newSettings) => {
  const db = initDB();
  const oldSettings = { ...(db.pricingSettings || defaultPricing) };
  db.pricingSettings = {
    ...oldSettings,
    ...newSettings,
  };
  saveDB(db);

  recordAdminAction('UPDATE_PRICING', 'PRICING', 'global', 'Duty & Subscription Pricing Settings', {
    newSettings,
    oldSettings,
  });

  return db.pricingSettings;
};

const getReviews = (driverId) => {
  const db = initDB();
  if (!driverId) return db.reviews || [];
  return (db.reviews || []).filter((r) => r.driverId === driverId);
};

const createReview = (reviewData) => {
  const db = initDB();
  const { driverId, otp } = reviewData;
  const ratingNum = Number(reviewData.rating) || 5;

  let verifiedByOtp = false;
  if (driverId) {
    const driver = db.drivers.find((d) => d.id === driverId);
    if (!driver) {
      throw new Error('Selected driver not found');
    }
    const expectedOtp = driver.reviewOtp || '4821';
    if (!otp || String(otp).trim() !== String(expectedOtp).trim()) {
      throw new Error(`Invalid Driver Review OTP. Please ask ${driver.name} for the 4-digit review OTP shown in their driver dashboard.`);
    }
    verifiedByOtp = true;
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    ...reviewData,
    rating: ratingNum,
    verifiedByOtp,
    createdAt: new Date().toISOString(),
  };
  if (!db.reviews) db.reviews = [];
  db.reviews.unshift(newReview);

  // If review is associated with a driver, update driver rating & trips
  if (reviewData.driverId) {
    const driver = db.drivers.find((d) => d.id === reviewData.driverId);
    if (driver) {
      const driverRevList = db.reviews.filter((r) => r.driverId === reviewData.driverId);
      const avg = (driverRevList.reduce((acc, r) => acc + (r.rating || 5), 0) / driverRevList.length).toFixed(1);
      driver.rating = Number(avg);
      driver.trips = (driver.trips || 0) + 1;
    }
  }

  saveDB(db);
  return newReview;
};

const createBooking = (bookingData) => {
  const db = initDB();
  const normalizedPhone = bookingData.customerPhone ? normalizeMobile(bookingData.customerPhone) : '';

  // Prevent rapid duplicate bookings (same normalized phone, same driver, within last 60 seconds)
  if (normalizedPhone && bookingData.driverId && Array.isArray(db.bookings)) {
    const now = Date.now();
    const duplicate = db.bookings.find((b) => {
      const matchPhone = normalizeMobile(b.customerPhone || '') === normalizedPhone;
      const matchDriver = String(b.driverId) === String(bookingData.driverId);
      const isRecent = b.createdAt && (now - new Date(b.createdAt).getTime() < 60000);
      return matchPhone && matchDriver && isRecent;
    });

    if (duplicate) {
      throw new DuplicateConstraintError(
        'A booking with this mobile number for this driver was just submitted. Please check your existing bookings.',
        'customerPhone',
        'DUPLICATE_BOOKING'
      );
    }
  }

  const newBooking = {
    id: `bk-${Date.now()}`,
    ...bookingData,
    customerPhone: normalizedPhone || bookingData.customerPhone,
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
  };
  db.bookings.unshift(newBooking);
  saveDB(db);
  return newBooking;
};

const getAllBookings = () => {
  const db = initDB();
  return db.bookings;
};

module.exports = {
  getPublicDrivers,
  getAllDriversForAdmin,
  getDriverByPhone,
  registerNewDriver,
  createDriverByAdmin,
  updateDriverByAdmin,
  deleteDriverByAdmin,
  unblockDriver,
  restoreDriver,
  extendSubscription,
  subscribeDriverPlan,
  updateDriverSelfProfile,
  updateDriverStatus,
  approveDriver,
  rejectDriver,
  blockDriver,
  getPricingSettings,
  updatePricingSettings,
  getAdminHistory,
  recordAdminAction,
  getReviews,
  createReview,
  createBooking,
  getAllBookings,
  cleanPhone,
  normalizeMobile,
  normalizeAadhaar,
  formatAadhaar,
  normalizeLicense,
  checkDriverUniqueness,
  DuplicateConstraintError,
};
