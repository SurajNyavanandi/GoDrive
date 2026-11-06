/**
 * Application Configuration & Environment Variable Loader
 * Reads strictly from .env process.env
 */
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded regardless of import order
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  BACKEND_API_URL: process.env.BACKEND_API_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

module.exports = env;
