const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

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
  level: isProd ? 'info' : 'debug',
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

  error: (msg, error) => {
    const maskedMsg = maskSensitiveData(String(msg));
    if (error instanceof Error) {
      pinoInstance.error({ err: { message: error.message, stack: error.stack, code: error.code } }, maskedMsg);
    } else if (error) {
      pinoInstance.error({ err: error }, maskedMsg);
    } else {
      pinoInstance.error(maskedMsg);
    }
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
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: status,
        durationMs,
      },
      `API ${req.method} ${req.originalUrl || req.path} -> ${status} (${durationMs}ms)`
    );
  },
};

module.exports = logger;
