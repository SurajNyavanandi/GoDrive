const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database instance with connection pooling.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || env.MONGO_URI;
  if (!rawUri) {
    logger.info('[Database] Running in local in-memory & JSON storage mode');
    return false;
  }

  let mongoUri = rawUri.trim();
  // Append database name if cluster URL provided without one
  if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('/', 14)) {
    mongoUri = `${mongoUri}/manadrivers?retryWrites=true&w=majority`;
  }

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully with connection pooling (pool size: 2-10)');
    return true;
  } catch (err) {
    logger.warn('[Database] Operating with local in-memory & file storage (Atlas unavailable or IP not whitelisted): ' + err.message);
    return false;
  }
};

module.exports = connectDB;
