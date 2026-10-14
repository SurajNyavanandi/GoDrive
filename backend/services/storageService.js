const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DRIVERS = [
  {
    id: 'drv-01',
    name: 'Ramesh Kumar',
    driverType: 'freelance',
    vehicle: 'Manual & Automatic Cars',
    rating: 4.9,
    trips: 120,
    hourlyRate: 180,
    monthlySalary: null,
    location: 'Hitec City & Cyberabad, Hyderabad',
    status: 'Available',
    languages: 'Telugu, Hindi, English',
    experience: 7,
    phone: '+91 98765 43210',
    rawPhone: '9876543210',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Punctual driver with 7 years experience. Specialist in Hitec City IT campuses and Outer Ring Road.',
    listingPlan: 'First 3 Months Free (₹49 Fee)',
    listingStatus: 'Verified Driver',
    isApproved: true,
    licenseNo: 'TS09-2018-0091234',
    aadhaarNo: '5432-8765-4321',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-02',
    name: 'Sunitha Varma',
    driverType: 'freelance',
    vehicle: 'Manual & Automatic Cars',
    rating: 4.92,
    trips: 95,
    hourlyRate: 160,
    monthlySalary: null,
    location: 'Madhapur, Hyderabad',
    status: 'Available',
    languages: 'Telugu, English, Hindi',
    experience: 5,
    phone: '+91 94440 98765',
    rawPhone: '9444098765',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Verified female private driver. Ideal for school runs, family shopping, and IT office commutes.',
    listingPlan: 'First 3 Months Free (₹49 Fee)',
    listingStatus: 'Verified Driver',
    isApproved: true,
    licenseNo: 'TS09-2020-0082341',
    aadhaarNo: '9876-5432-1098',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-03',
    name: 'Shanker',
    driverType: 'permanent',
    vehicle: 'Manual & Automatic Cars',
    rating: 4.95,
    trips: 140,
    hourlyRate: 200,
    monthlySalary: 20000,
    location: 'Gachibowli (Financial District), Hyderabad',
    status: 'Available',
    languages: 'Telugu, Hindi, English',
    experience: 8,
    phone: '+91 90302 60417',
    rawPhone: '9030260417',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Experienced full-time monthly driver looking for dedicated family or corporate assignment in Gachibowli.',
    listingPlan: 'First 3 Months Free (₹99 Fee)',
    listingStatus: 'Verified Monthly Chauffeur',
    isApproved: true,
    licenseNo: 'TS09-2017-0060417',
    aadhaarNo: '9030-2604-1717',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-04',
    name: 'Suresh Patil',
    driverType: 'permanent',
    vehicle: 'Manual & Automatic Cars',
    rating: 4.96,
    trips: 180,
    hourlyRate: 220,
    monthlySalary: 22000,
    location: 'Jubilee Hills, Hyderabad',
    status: 'Available',
    languages: 'Telugu, Hindi, Marathi',
    experience: 10,
    phone: '+91 98201 12345',
    rawPhone: '9820112345',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    bio: 'Reliable private family driver for executive commutes and daily family travel in Jubilee Hills & Banjara Hills.',
    listingPlan: 'First 3 Months Free (₹99 Fee)',
    listingStatus: 'Verified Monthly Chauffeur',
    isApproved: true,
    licenseNo: 'TS09-2015-0012345',
    aadhaarNo: '8201-1234-5678',
    createdAt: new Date().toISOString(),
  },
];

function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      drivers: INITIAL_DRIVERS,
      bookings: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    
    // Ensure all 4 seed drivers exist in data
    let modified = false;
    if (!data.drivers || !Array.isArray(data.drivers)) {
      data.drivers = INITIAL_DRIVERS;
      modified = true;
    } else {
      // Clean up seed drivers if previous mock data exists with old drivers
      const shankerExists = data.drivers.some(d => d.rawPhone === '9030260417' || d.name === 'Shanker');
      if (!shankerExists || data.drivers.length > 10) {
        data.drivers = INITIAL_DRIVERS;
        modified = true;
      }
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
    console.error('Failed to read db.json, re-initializing:', err.message);
    const defaultData = {
      drivers: INITIAL_DRIVERS,
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
    console.error('Error saving db.json:', err.message);
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
  const existing = db.drivers.find((d) => cleanPhone(d.rawPhone || d.phone) === raw);
  if (existing) {
    return { success: false, message: 'A driver application with this mobile number already exists.' };
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

const rejectDriver = (id) => {
  const db = initDB();
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
