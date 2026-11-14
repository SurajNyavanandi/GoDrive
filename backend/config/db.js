const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');
const logger = require('../utils/logger');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records
// across all environments (e.g. Windows where local router DNS refuses SRV queries)
if (!env.isTest) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (dnsErr) {
    logger.warn('[Database] Could not set custom DNS fallback servers:', dnsErr.message);
  }
}

let isConnected = false;
let connectionListenersSetup = false;

function setupConnectionListeners() {
  if (connectionListenersSetup) return;
  connectionListenersSetup = true;

  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('[Database] MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('[Database] MongoDB connection disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('[Database] MongoDB connection re-established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('[Database] MongoDB runtime connection error:', err);
  });
}

/**
 * Connect to MongoDB database instance with connection pooling and retry logic.
 * @param {number} maxRetries
 * @param {number} retryDelayMs
 */
const connectDB = async (maxRetries = 3, retryDelayMs = 1500) => {
  setupConnectionListeners();
  mongoose.set('bufferCommands', false);
  mongoose.set('autoIndex', !env.isProduction);

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (mongoose.connection.readyState === 2) {
    try {
      await mongoose.connection.asPromise();
      isConnected = true;
      return true;
    } catch (_waitErr) {
      // Fall through to retry connection
    }
  }

  const rawUri = (env.isTest && process.env.MONGO_URI) || env.MONGO_URI || env.MONGODB_URI;
  if (!rawUri) {
    logger.info('[Database] Running in local in-memory & JSON storage mode');
    return false;
  }

  let mongoUri = rawUri.trim();
  if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('/', 14)) {
    mongoUri = `${mongoUri}/manadrivers?retryWrites=true&w=majority`;
  }

  const isTest = env.isTest;
  const effectiveMaxRetries = isTest ? 1 : maxRetries;
  const effectiveDelay = isTest ? 50 : retryDelayMs;

  const poolOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: isTest ? 1000 : 5000,
    connectTimeoutMS: isTest ? 1000 : 5000,
    autoIndex: !env.isProduction,
  };

  for (let attempt = 1; attempt <= effectiveMaxRetries; attempt++) {
    try {
      await mongoose.connect(mongoUri, poolOptions);
      isConnected = true;
      logger.info('MongoDB connected successfully with connection pooling (pool: 2-10)');
      return true;
    } catch (err) {
      logger.warn(`[Database] Connection attempt ${attempt}/${effectiveMaxRetries} failed: ${err.message}`);
      if (attempt < effectiveMaxRetries) {
        await new Promise((resolve) => setTimeout(resolve, effectiveDelay * attempt));
      }
    }
  }

  logger.warn('[Database] Operating with local in-memory & file storage (Atlas unavailable or IP not whitelisted)');
  return false;
};

/**
 * Cleanly close database connections
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      isConnected = false;
      logger.info('[Database] MongoDB connection closed cleanly');
    }
  } catch (err) {
    logger.error('[Database] Error closing MongoDB connection:', err);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.isDbConnected = () => isConnected || mongoose.connection.readyState === 1;
