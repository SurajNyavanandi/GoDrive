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

// Initial clean dataset for production deployment - strictly no dummy drivers
const getInitialSampleDrivers = () => {
  return [];
};

function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      drivers: [],
      bookings: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
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

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

    return data;
  } catch (err) {
    logger.error('Failed to read db.json, re-initializing', err);
    const defaultData = {
      drivers: [],
      bookings: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
}

function saveDB(data, action = 'SAVE_DB') {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    logger.db(action, {
      driverCount: data.drivers ? data.drivers.length : 0,
      bookingCount: data.bookings ? data.bookings.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`Error saving db.json during ${action}`, err);
  }
}

// Helpers
const cleanPhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');

const enrichDriverSubscriptionInfo = (driver) => {
  const remainingDays = computeRemainingDays(driver.subscriptionExpiry);
  let subscriptionStatusText = '';
  
  if (!driver.isApproved) {
    subscriptionStatusText = 'Pending Admin Verification';
  } else if (remainingDays > 0) {
    subscriptionStatusText = `+${remainingDays} days left`;
  } else {
    subscriptionStatusText = `${remainingDays} days expired`;
  }

  return {
    ...driver,
    remainingDays,
    subscriptionStatusText,
    isTrial: driver.subscriptionPlan === 'free_trial',
    isExpired: driver.isApproved && remainingDays <= 0,
    phoneMasked: driver.phone ? driver.phone.replace(/(\d{3})\d{5}(\d{2})/, '$1 ***** $2') : '+91 90302 *****',
  };
};

/**
 * Public Homepage Drivers:
 * - Must be approved (`isApproved !== false`)
 * - Must have active subscription or trial (`remainingDays > 0`)
 */
const getPublicDrivers = () => {
  const db = initDB();
  return db.drivers
    .map(enrichDriverSubscriptionInfo)
    .filter((d) => d.isApproved && d.remainingDays > 0)
    .sort((a, b) => {
      // Prioritize Featured Plan drivers first
      if (a.subscriptionPlan === 'featured' && b.subscriptionPlan !== 'featured') return -1;
      if (b.subscriptionPlan === 'featured' && a.subscriptionPlan !== 'featured') return 1;
      return 0;
    });
};

const getAllDriversForAdmin = () => {
  const db = initDB();
  return db.drivers.map(enrichDriverSubscriptionInfo);
};

const getDriverByPhone = (phone) => {
  const raw = cleanPhone(phone);
  const db = initDB();
  const driver = db.drivers.find(
    (d) => cleanPhone(d.rawPhone || d.phone) === raw || (raw.length >= 10 && cleanPhone(d.phone).endsWith(raw.slice(-10)))
  );
  return driver ? enrichDriverSubscriptionInfo(driver) : null;
};

const registerNewDriver = (driverData) => {
  const db = initDB();
  const raw = cleanPhone(driverData.phone);
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  // Check if driver with phone already exists
  const existingIndex = db.drivers.findIndex((d) => cleanPhone(d.rawPhone || d.phone) === raw);
  if (existingIndex !== -1) {
    const existing = db.drivers[existingIndex];
    if (existing.isApproved) {
      return { success: false, message: 'A verified driver account with this mobile number already exists. Please log in.' };
    }
    // Update existing pending application
    const formattedPhone = raw.length === 10 ? `+91 ${raw.slice(0,5)} ${raw.slice(5)}` : driverData.phone;
    db.drivers[existingIndex] = {
      ...existing,
      name: driverData.name || existing.name,
      driverType: driverData.driverType || (driverData.workingPreference?.includes('monthly') ? 'permanent' : 'freelance'),
      phone: formattedPhone,
      rawPhone: raw,
      location: driverData.location || existing.location,
      experience: Number(driverData.experience) || existing.experience,
      languages: driverData.languages || existing.languages,
      bio: driverData.bio || existing.bio,
      licenseNo: driverData.licenseNo || existing.licenseNo,
      licensePhoto: driverData.licensePhoto || existing.licensePhoto,
      aadhaarNo: driverData.aadhaarNo || existing.aadhaarNo,
      aadhaarPhoto: driverData.aadhaarPhoto || existing.aadhaarPhoto,
      workingPreference: driverData.workingPreference || existing.workingPreference,
      photo: driverData.photo || existing.photo,
      isApproved: false,
      listingStatus: 'Pending Admin Verification',
      subscriptionPlan: 'free_trial',
      subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDB(db);
    return { success: true, driver: enrichDriverSubscriptionInfo(db.drivers[existingIndex]), updated: true };
  }

  const formattedPhone = raw.length === 10 ? `+91 ${raw.slice(0,5)} ${raw.slice(5)}` : driverData.phone;

  const newDriver = {
    id: `drv-${Date.now()}`,
    name: driverData.name,
    driverType: driverData.driverType || (driverData.workingPreference?.includes('monthly') ? 'permanent' : 'freelance'),
    vehicle: driverData.vehicle || 'Manual & Automatic Cars',
    rating: 5.0,
    trips: 0,
    hourlyRate: Number(driverData.hourlyRate) || (driverData.driverType === 'permanent' ? 200 : 180),
    monthlySalary: Number(driverData.monthlySalary) || (driverData.driverType === 'permanent' ? 20000 : null),
    location: driverData.location || 'Hyderabad',
    status: 'Available',
    languages: driverData.languages || 'Telugu, Hindi, English',
    experience: Number(driverData.experience) || 3,
    phone: formattedPhone,
    rawPhone: raw,
    photo: driverData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bio: driverData.bio || 'Verified Hyderabad driver.',
    licenseNo: driverData.licenseNo,
    licensePhoto: driverData.licensePhoto,
    aadhaarNo: driverData.aadhaarNo,
    aadhaarPhoto: driverData.aadhaarPhoto,
    workingPreference: driverData.workingPreference,
    isApproved: false, // Pending admin approval
    listingStatus: 'Pending Admin Verification',
    subscriptionPlan: 'free_trial',
    subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(), // 90 days (3 months) free trial upon registration
    createdAt: new Date().toISOString(),
  };

  db.drivers.unshift(newDriver);
  saveDB(db);

  return { success: true, driver: enrichDriverSubscriptionInfo(newDriver) };
};

/**
 * Admin direct driver creation (CRUD)
 */
const createDriverByAdmin = (driverData) => {
  const db = initDB();
  const raw = cleanPhone(driverData.phone);
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const formattedPhone = raw.length === 10 ? `+91 ${raw.slice(0,5)} ${raw.slice(5)}` : driverData.phone;

  const newDriver = {
    id: `drv-admin-${Date.now()}`,
    name: driverData.name || 'New Driver',
    phone: formattedPhone,
    rawPhone: raw,
    driverType: driverData.driverType || 'freelance',
    hourlyRate: Number(driverData.hourlyRate) || 180,
    monthlySalary: driverData.monthlySalary ? Number(driverData.monthlySalary) : null,
    location: driverData.location || 'Hitec City',
    experience: Number(driverData.experience) || 3,
    rating: 5.0,
    trips: 0,
    status: driverData.status || 'Available',
    languages: driverData.languages || 'Telugu, Hindi',
    photo: driverData.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: driverData.bio || 'Verified driver created by admin.',
    licenseNo: driverData.licenseNo || 'TS09-2023-0000000',
    aadhaarNo: driverData.aadhaarNo || '0000-0000-0000',
    licensePhoto: driverData.licensePhoto || null,
    aadhaarPhoto: driverData.aadhaarPhoto || null,
    isApproved: true,
    listingStatus: driverData.subscriptionPlan === 'featured' ? 'Featured Chauffeur' : 'Verified Driver',
    subscriptionPlan: driverData.subscriptionPlan || 'free_trial',
    subscriptionExpiry: new Date(now + 90 * DAY_MS).toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.drivers.unshift(newDriver);
  saveDB(db);
  return enrichDriverSubscriptionInfo(newDriver);
};

/**
 * Admin update driver (CRUD)
 */
const updateDriverByAdmin = (id, updateData) => {
  const db = initDB();
  const index = db.drivers.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const existing = db.drivers[index];
  const updated = {
    ...existing,
    ...updateData,
    hourlyRate: updateData.hourlyRate !== undefined ? Number(updateData.hourlyRate) : existing.hourlyRate,
    monthlySalary: updateData.monthlySalary !== undefined ? (updateData.monthlySalary ? Number(updateData.monthlySalary) : null) : existing.monthlySalary,
    experience: updateData.experience !== undefined ? Number(updateData.experience) : existing.experience,
    updatedAt: new Date().toISOString(),
  };

  db.drivers[index] = updated;
  saveDB(db);
  return enrichDriverSubscriptionInfo(updated);
};

/**
 * Admin delete driver (CRUD)
 */
const deleteDriverByAdmin = (id) => {
  const db = initDB();
  const initialCount = db.drivers.length;
  db.drivers = db.drivers.filter((d) => d.id !== id);
  saveDB(db);
  return db.drivers.length < initialCount;
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

  driver.subscriptionExpiry = newExpiry;
  if (!driver.subscriptionPlan || driver.subscriptionPlan === 'none') {
    driver.subscriptionPlan = 'starter';
  }
  driver.listingStatus = driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver';
  saveDB(db);
  return enrichDriverSubscriptionInfo(driver);
};

/**
 * Driver self subscription payment (Starter ₹49 / Featured ₹99)
 */
const subscribeDriverPlan = (id, plan = 'starter') => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const DAY_MS = 24 * 60 * 60 * 1000;
  const currentExpiry = new Date(driver.subscriptionExpiry).getTime();
  const now = Date.now();
  const baseTime = !isNaN(currentExpiry) && currentExpiry > now ? currentExpiry : now;
  
  driver.subscriptionPlan = plan;
  driver.subscriptionExpiry = new Date(baseTime + 30 * DAY_MS).toISOString(); // 30 days added
  driver.isApproved = true;
  driver.listingStatus = plan === 'featured' ? 'Featured Chauffeur' : (driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver');
  
  saveDB(db);
  return enrichDriverSubscriptionInfo(driver);
};

const updateDriverSelfProfile = (id, profileData) => {
  const db = initDB();
  const index = db.drivers.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const existing = db.drivers[index];
  const updated = {
    ...existing,
    name: profileData.name || existing.name,
    hourlyRate: profileData.hourlyRate ? Number(profileData.hourlyRate) : existing.hourlyRate,
    monthlySalary: profileData.monthlySalary ? Number(profileData.monthlySalary) : existing.monthlySalary,
    location: profileData.location || existing.location,
    languages: profileData.languages || existing.languages,
    bio: profileData.bio || existing.bio,
    photo: profileData.photo || existing.photo,
    updatedAt: new Date().toISOString(),
  };

  db.drivers[index] = updated;
  saveDB(db);
  return enrichDriverSubscriptionInfo(updated);
};

const updateDriverStatus = (id, status) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  driver.status = status;
  saveDB(db);
  return enrichDriverSubscriptionInfo(driver);
};

const approveDriver = (id) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  driver.isApproved = true;
  // Grant 3-month (90 days) free trial if expiry is not set or passed
  if (!driver.subscriptionExpiry || computeRemainingDays(driver.subscriptionExpiry) <= 0) {
    driver.subscriptionPlan = 'free_trial';
    driver.subscriptionExpiry = new Date(now + 90 * DAY_MS).toISOString();
  }

  driver.listingStatus = driver.subscriptionPlan === 'featured' ? 'Featured Chauffeur' : (driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver');
  saveDB(db);
  return enrichDriverSubscriptionInfo(driver);
};

const rejectDriver = (id) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return false;

  db.drivers = db.drivers.filter((d) => d.id !== id);
  saveDB(db);
  return true;
};

const createBooking = (bookingData) => {
  const db = initDB();
  const newBooking = {
    id: `bk-${Date.now()}`,
    ...bookingData,
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
  extendSubscription,
  subscribeDriverPlan,
  updateDriverSelfProfile,
  updateDriverStatus,
  approveDriver,
  rejectDriver,
  createBooking,
  getAllBookings,
  cleanPhone,
};
