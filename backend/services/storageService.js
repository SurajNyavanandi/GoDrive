const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DRIVERS = [];

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

function saveDB(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error('Error saving db.json', err);
  }
}

// Helpers
const cleanPhone = (phone) => String(phone || '').replace(/[^0-9]/g, '');

const getPublicDrivers = () => {
  const db = initDB();
  return db.drivers
    .filter((d) => d.isApproved !== false)
    .map((d) => ({
      ...d,
      // Mask phone number for public display
      phoneMasked: d.phone ? d.phone.replace(/(\d{3})\d{5}(\d{2})/, '$1 ***** $2') : '+91 90302 *****',
    }));
};

const getAllDriversForAdmin = () => {
  const db = initDB();
  return db.drivers;
};

const getDriverByPhone = (phone) => {
  const raw = cleanPhone(phone);
  const db = initDB();
  return db.drivers.find((d) => cleanPhone(d.rawPhone || d.phone) === raw || (raw.length >= 10 && cleanPhone(d.phone).endsWith(raw.slice(-10))));
};

const registerNewDriver = (driverData) => {
  const db = initDB();
  const raw = cleanPhone(driverData.phone);
  
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
      updatedAt: new Date().toISOString(),
    };
    saveDB(db);
    return { success: true, driver: db.drivers[existingIndex], updated: true };
  }

  const formattedPhone = raw.length === 10 ? `+91 ${raw.slice(0,5)} ${raw.slice(5)}` : driverData.phone;

  const newDriver = {
    id: `drv-${Date.now()}`,
    name: driverData.name,
    driverType: driverData.driverType || (driverData.workingPreference?.includes('monthly') ? 'permanent' : 'freelance'),
    vehicle: driverData.vehicle || 'Manual & Automatic Cars',
    rating: 5.0,
    trips: 0,
    hourlyRate: Number(driverData.hourlyRate) || 180,
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
    createdAt: new Date().toISOString(),
  };

  db.drivers.unshift(newDriver);
  saveDB(db);

  return { success: true, driver: newDriver };
};

const updateDriverStatus = (id, status) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  driver.status = status;
  saveDB(db);
  return driver;
};

const approveDriver = (id) => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return null;

  driver.isApproved = true;
  driver.listingStatus = driver.driverType === 'permanent' ? 'Verified Monthly Chauffeur' : 'Verified Driver';
  saveDB(db);
  return driver;
};

const rejectDriver = (id, reason = '') => {
  const db = initDB();
  const driver = db.drivers.find((d) => d.id === id);
  if (!driver) return false;

  // Filter out rejected driver
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
  updateDriverStatus,
  approveDriver,
  rejectDriver,
  createBooking,
  getAllBookings,
  cleanPhone,
};
