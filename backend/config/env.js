/**
 * Application Configuration & Environment Variable Loader
 * Reads from .env with fallback defaults for seamless sandbox execution.
 */
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded regardless of import order
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 1. Database Connection (empty default allows instant local JSON/in-memory storage mode)
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',

  // 2. JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || 'mana_drivers_jwt_secret_key_2025',

  // 3. Super Admin Email
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'kanusuraj15@gmail.com').toLowerCase().trim(),

  // 4. Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TnM27jHHHHOsFP',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'lxCuSOQm3h0q0hGw2kE35lzz',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // 5. Backend Public API URL
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'https://manadrivers.com',

  // 6. CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // 7. Third-Party Integrations
  RESEND_API_KEY: process.env.RESEND_API_KEY || 're_xxx',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'supportmanadrivers@gmail.com',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'abjxnpfd',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '578639335857171',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'hCILIbHDym1PbzgMpgAnFKB29yg',
};

module.exports = env;
