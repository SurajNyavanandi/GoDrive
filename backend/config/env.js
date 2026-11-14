/**
 * Unified Environment Configuration Module
 * Validates environment variables at startup using Zod and fails fast in production if required variables are missing.
 * Resolves root-level .env regardless of the directory the process is launched from.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

// Search upwards to find project root (where root package.json with workspaces or .env exists)
function findProjectRoot() {
  let curr = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidatePkg = path.join(curr, 'package.json');
    if (fs.existsSync(candidatePkg)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(candidatePkg, 'utf-8'));
        if (pkg.workspaces) {
          return curr;
        }
      } catch {
        // Continue searching
      }
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return path.resolve(__dirname, '../..');
}

const projectRoot = findProjectRoot();
const rootEnvPath = path.join(projectRoot, '.env');

// Load environment variables from the single consolidated root .env file
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const currentEnv = process.env.NODE_ENV || 'development';
const isProduction = currentEnv === 'production';
const isTest = currentEnv === 'test';

// Base schema for environment variables
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default(
    isProduction ? 'info' : 'debug'
  ),
  MONGO_URI: isProduction
    ? z.string().min(1, 'MONGO_URI (or MONGODB_URI) is required in production')
    : z.string().default(''),
  MONGODB_URI: z.string().default(''),
  CLIENT_URL: z.string().default(''),
  FRONTEND_URL: z.string().default(''),
  JWT_SECRET: isProduction
    ? z.string().min(16, 'JWT_SECRET must be at least 16 characters in production')
    : z.string().default('dev_jwt_secret_mana_drivers_2026_safe_fallback'),
  JWT_EXPIRE: z.string().default('7d'),
  ADMIN_EMAIL: z.string().default(''),
  ADMIN_EMAILS: z.string().default(''),
  ADMIN_API_KEY: z.string().default(''),
  RAZORPAY_KEY_ID: z.string().default(''),
  RAZORPAY_KEY_SECRET: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(''),
  BACKEND_API_URL: z.string().default(''),
  ALLOWED_ORIGINS: isProduction
    ? z.string().refine((val) => val && val.trim() !== '*', {
        message: 'ALLOWED_ORIGINS (or CORS_ORIGIN) must be specified without wildcard (*) in production',
      })
    : z.string().default('*'),
  CORS_ORIGIN: z.string().default('*'),
  RESEND_API_KEY: z.string().default(''),
  RESEND_FROM_EMAIL: z.string().default('support@manadrivers.com'),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  MSG91_AUTH_KEY: z.string().default(''),
  MSG91_TEMPLATE_ID: z.string().default(''),
  // Frontend VITE variables (loaded in unified .env)
  VITE_BACKEND_API_URL: z.string().default(''),
  VITE_API_URL: z.string().default(''),
  VITE_RAZORPAY_KEY_ID: z.string().default(''),
  VITE_SENTRY_DSN: z.string().default(''),
});

const mongoResolved = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const clientResolved = process.env.CLIENT_URL || process.env.FRONTEND_URL || '';

const rawEnv = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  MONGO_URI: mongoResolved,
  MONGODB_URI: mongoResolved,
  CLIENT_URL: clientResolved,
  FRONTEND_URL: clientResolved,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || '',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || (isProduction && clientResolved ? clientResolved : undefined),
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
  MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID,
  VITE_BACKEND_API_URL: process.env.VITE_BACKEND_API_URL,
  VITE_API_URL: process.env.VITE_API_URL,
  VITE_RAZORPAY_KEY_ID: process.env.VITE_RAZORPAY_KEY_ID,
  VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN,
};

const result = envSchema.safeParse(rawEnv);

if (!result.success) {
  console.error('\x1b[31m[CONFIG FATAL ERROR] Invalid or missing environment configuration:\x1b[0m');
  result.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  if (isProduction) {
    process.exit(1);
  }
}

const parsedData = result.success ? result.data : rawEnv;

const combinedRaw = [parsedData.ADMIN_EMAILS || '', parsedData.ADMIN_EMAIL || ''].join(',');
const rawAdminEmails = combinedRaw
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e && e.includes('@'));
const uniqueAdminEmails = Array.from(new Set(rawAdminEmails));

const env = Object.freeze({
  ...parsedData,
  adminEmails: Object.freeze(uniqueAdminEmails),
  isProduction: parsedData.NODE_ENV === 'production',
  isTest: parsedData.NODE_ENV === 'test',
  isDev: parsedData.NODE_ENV === 'development',
});

module.exports = env;
