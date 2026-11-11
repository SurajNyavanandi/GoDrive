/**
 * MANA DRIVERS - Dedicated Seed Script
 * 
 * Run manually to populate the database with initial approved drivers and verified reviews:
 *   npm run seed
 * or
 *   node backend/scripts/seed.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

const seedDrivers = [
  {
    id: 'drv-hyd-101',
    name: 'Suresh Reddy',
    phone: '+91 98490 12345',
    rawPhone: '9849012345',
    driverType: 'freelance',
    hourlyRate: 175,
    location: 'Hitec City',
    experience: 8,
    languages: 'Telugu, Hindi, English',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Professional chauffeur specializing in luxury sedans and SUVs. 8+ years across Cyber Towers, Gachibowli, and Airport express routes.',
    licenseNo: 'TS-09-2016-0045231',
    aadhaarNo: '5432-8765-4321',
    rating: 4.95,
    trips: 142,
    status: 'Available',
    subscriptionPlan: 'featured',
    subscriptionExpiry: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: 85,
    isApproved: true,
    reviewOtp: '4821',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-hyd-102',
    name: 'Mohammed Abdul',
    phone: '+91 98492 54321',
    rawPhone: '9849254321',
    driverType: 'permanent',
    monthlySalary: 26000,
    location: 'Banjara Hills',
    experience: 11,
    languages: 'Urdu, Telugu, Hindi, English',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Punctual, non-smoking family chauffeur. Specialized in automatic transmission, daily school drops, and corporate duties.',
    licenseNo: 'TS-10-2013-0098124',
    aadhaarNo: '6789-1234-5678',
    rating: 4.90,
    trips: 98,
    status: 'Available',
    subscriptionPlan: 'starter',
    subscriptionExpiry: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: 80,
    isApproved: true,
    reviewOtp: '3914',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-hyd-103',
    name: 'Venkat Rao',
    phone: '+91 98480 98765',
    rawPhone: '9848098765',
    driverType: 'combined',
    hourlyRate: 180,
    monthlySalary: 28000,
    location: 'Gachibowli',
    experience: 6,
    languages: 'Telugu, Hindi',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'Expert route knowledge for ORR, Financial District, and weekend outstation trips to Vijayawada and Srisailam.',
    licenseNo: 'TS-07-2018-0076543',
    aadhaarNo: '8901-2345-6789',
    rating: 4.88,
    trips: 76,
    status: 'Available',
    subscriptionPlan: 'free_trial',
    subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: 90,
    isApproved: true,
    reviewOtp: '7256',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-hyd-104',
    name: 'Rajesh Kumar',
    phone: '+91 99890 34567',
    rawPhone: '9989034567',
    driverType: 'permanent',
    monthlySalary: 30000,
    location: 'Jubilee Hills',
    experience: 14,
    languages: 'Telugu, Hindi, English',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: 'Executive VIP chauffeur with defensive driving training. Skilled in Mercedes, BMW, Audi, and Toyota Fortuner.',
    licenseNo: 'TS-11-2010-0012987',
    aadhaarNo: '3456-7890-1234',
    rating: 5.0,
    trips: 215,
    status: 'Available',
    subscriptionPlan: 'featured',
    subscriptionExpiry: new Date(Date.now() + 88 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: 88,
    isApproved: true,
    reviewOtp: '6149',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drv-hyd-105',
    name: 'Shiva Krishna',
    phone: '+91 97000 87654',
    rawPhone: '9700087654',
    driverType: 'freelance',
    hourlyRate: 175,
    location: 'Kondapur',
    experience: 5,
    languages: 'Telugu, Hindi',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Careful city driver for night parties, airport drops, and doctor appointments in Madhapur and Hitec City.',
    licenseNo: 'TS-09-2019-0065432',
    aadhaarNo: '4567-8901-2345',
    rating: 4.85,
    trips: 64,
    status: 'Available',
    subscriptionPlan: 'free_trial',
    subscriptionExpiry: new Date(Date.now() + 87 * 24 * 60 * 60 * 1000).toISOString(),
    remainingDays: 87,
    isApproved: true,
    reviewOtp: '5192',
    createdAt: new Date().toISOString(),
  },
];

const initialReviews = [
  {
    id: 'rev-seed-1',
    author: 'Kavitha Rao',
    rating: 5,
    title: 'Excellent family driver for parents',
    quote: 'We booked Suresh for taking my elderly parents to Apollo Hospital and shopping. Extremely courteous and safe driving.',
    driverId: 'drv-hyd-101',
    driverName: 'Suresh Reddy',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-seed-2',
    author: 'Arun Varma',
    rating: 5,
    title: 'Punctual and very smooth driving',
    quote: 'Rajesh is very professional and handled our Fortuner with exceptional care on the ORR. Highly recommended!',
    driverId: 'drv-hyd-104',
    driverName: 'Rajesh Kumar',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function runSeed() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let data = {
    drivers: [],
    bookings: [],
    pricingSettings: defaultPricing,
    reviews: [],
    adminHistory: [],
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
      // fallback
    }
  }

  data.drivers = seedDrivers;
  data.reviews = initialReviews;
  if (!data.pricingSettings) data.pricingSettings = defaultPricing;
  if (!data.bookings) data.bookings = [];
  if (!data.adminHistory) data.adminHistory = [];

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Seed completed successfully: 5 verified drivers and reviews populated into backend/data/db.json');
}

if (require.main === module) {
  runSeed();
}

module.exports = { seedDrivers, initialReviews, runSeed };
