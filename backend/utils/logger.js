const isProd = process.env.NODE_ENV === 'production';

function getTimestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg, ...args) => {
    console.log(`[INFO] [${getTimestamp()}] ${msg}`, ...args);
  },

  db: (action, details) => {
    const time = getTimestamp();
    if (!isProd) {
      console.log(`\x1b[32m[DB Operation]\x1b[0m [${time}] Action: ${action}`, details ? JSON.stringify(details, null, 2) : '');
    } else {
      console.log(`[DB Operation] [${time}] Action: ${action}`);
    }
  },

  api: (req, res, durationMs) => {
    const time = getTimestamp();
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[API Request]\x1b[0m [${time}] ${req.method} ${req.originalUrl || req.path} -> Status ${status} (${durationMs}ms)`);
  },

  warn: (msg, ...args) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m [${getTimestamp()}] ${msg}`, ...args);
  },

  error: (msg, error) => {
    const time = getTimestamp();
    console.error(`\x1b[31m[ERROR]\x1b[0m [${time}] ${msg}`);
    if (error) {
      if (error.stack) {
        console.error(`\x1b[31m[Stack Trace]\x1b[0m\n`, error.stack);
      } else {
        console.error(`\x1b[31m[Error Details]\x1b[0m`, error);
      }
    }
  },
};

module.exports = logger;
