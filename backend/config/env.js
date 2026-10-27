/**
 * Application Configuration & Direct Secret Fallbacks
 * Configured so the application can run directly in code without requiring external .env files.
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI:
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb+srv://kanukulashekhar15_db_user:vJKgFDeyKlwiKDYQ@cluster0.pdc6tmh.mongodb.net/manadrivers?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RESEND_API_KEY: process.env.RESEND_API_KEY || 're_xxx',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TnM27jHHHHOsFP',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'lxCuSOQm3h0q0hGw2kE35lzz',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'abjxnpfd',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '578639335857171',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'hCILIbHDym1PbzgMpgAnFKB29yg',
};

module.exports = env;
