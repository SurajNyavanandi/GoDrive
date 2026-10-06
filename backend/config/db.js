const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('MONGO_URI not set — database offline mode active');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.warn('MongoDB connection failed — database offline mode active:', err.message);
    return false;
  }
};

module.exports = connectDB;
