const Sentry = require('@sentry/node');
const isProd = process.env.NODE_ENV === 'production';

if (isProd && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const logger = {
  info: (msg, ...args) => {
    if (!isProd) console.log(`[INFO] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    if (!isProd) console.warn(`[WARN] ${msg}`, ...args);
  },
  error: (msg, error) => {
    console.error(`[ERROR] ${msg}`, error || '');
    if (isProd && process.env.SENTRY_DSN) {
      Sentry.captureException(error || new Error(msg));
    }
  }
};

module.exports = logger;
