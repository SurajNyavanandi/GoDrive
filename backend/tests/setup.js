const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer = null;

async function setupTestDb() {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000,
      },
    });
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    process.env.MONGODB_URI = uri;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  }
  return mongoServer;
}

async function teardownTestDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
  } catch (_e) {
    // Ignore close error
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

module.exports = { setupTestDb, teardownTestDb };
