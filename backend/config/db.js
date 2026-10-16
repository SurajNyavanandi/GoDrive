const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance with graceful in-memory fallback.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!rawUri) {
    console.log('[Database] Running in local in-memory & JSON storage mode');
    return false;
  }

  let mongoUri = rawUri.trim();
  // Append database name if cluster URL provided without one
  if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('/', 14)) {
    mongoUri = `${mongoUri}/manadrivers?retryWrites=true&w=majority`;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (_err) {
    console.log('[Database] Operating with local in-memory & file storage (Atlas unavailable or IP not whitelisted)');
    return false;
  }
};

module.exports = connectDB;
