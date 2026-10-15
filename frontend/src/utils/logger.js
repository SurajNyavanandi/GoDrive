import * as Sentry from "@sentry/react";

const isProd = import.meta.env.MODE === 'production';

if (isProd && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
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
    if (isProd && import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error || new Error(msg));
    }
  }
};

export default logger;
