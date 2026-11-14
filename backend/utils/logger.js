const pino = require('pino');
const env = require('../config/env');

const isProd = env.isProduction;

// Masking helper for sensitive details in string messages
function maskSensitiveData(str) {
  if (typeof str !== 'string') return str;
  return str
    // Mask mobile numbers (e.g., +91 9849012345 or 9849012345)
    .replace(/(\+?91[\s-]?)?([6-9]\d{5})(\d{4})/g, '+91 ******$3')
    // Mask potential OTPs labeled in strings
    .replace(/(otp[\s:=]+)(\d{4,6})/gi, '$1******')
    // Mask passwords or tokens labeled in strings
    .replace(/(password[\s:=]+)(\S+)/gi, '$1******')
    .replace(/(bearer[\s]+)([a-zA-Z0-9_\-\.]+)/gi, '$1[REDACTED_TOKEN]');
}

// Pino instance with automatic redaction of sensitive object keys
const pinoInstance = pino({
  level: env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  redact: {
    paths: [
      'password',
      'otp',
      'token',
      'authorization',
      '*.password',
      '*.otp',
      '*.token',
      '*.authorization',
      'headers.authorization',
      'req.headers.authorization',
      'creditCard',
      'card',
      'cardNumber',
      'cvv',
      'secret',
      '*.secret',
      'aadhaarNo',
      '*.aadhaarNo',
      'reviewOtp',
      '*.reviewOtp',
      'apiKey',
      '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

const logger = {
  pino: pinoInstance,

  info: (msg, ...args) => {
    pinoInstance.info(args.length ? { extra: args } : {}, maskSensitiveData(String(msg)));
  },

  warn: (msg, ...args) => {
    pinoInstance.warn(args.length ? { extra: args } : {}, maskSensitiveData(String(msg)));
  },

  error: (msg, error, meta = {}) => {
    const maskedMsg = maskSensitiveData(String(msg));
    const extra = { ...meta };
    if (error instanceof Error) {
      extra.err = { message: error.message, stack: error.stack, code: error.code };
    } else if (error) {
      extra.err = error;
    }
    pinoInstance.error(extra, maskedMsg);
  },

  debug: (msg, ...args) => {
    if (!isProd) {
      pinoInstance.debug(args.length ? { extra: args } : {}, maskSensitiveData(String(msg)));
    }
  },

  db: (action, details) => {
    if (!isProd) {
      pinoInstance.debug({ dbAction: action, details }, `[DB Operation] Action: ${action}`);
    } else {
      pinoInstance.info({ dbAction: action }, `[DB Operation] Action: ${action}`);
    }
  },

  api: (req, res, durationMs) => {
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    pinoInstance[level](
      {
        reqId: req.id || req.headers?.['x-request-id'] || 'no-req-id',
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: status,
        durationMs,
      },
      `API [${req.id || 'req'}] ${req.method} ${req.originalUrl || req.path} -> ${status} (${durationMs}ms)`
    );
  },
};

module.exports = logger;
