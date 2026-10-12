const mongoose = require('mongoose');
const config = require('./env');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Connected to MongoDB at: ${config.mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Local MongoDB not reachable at ${config.mongoUri} (${error.message}).`);
    console.log(`🧠 Initializing in-memory MongoDB server (development mode)...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ Connected to In-Memory MongoDB at: ${inMemoryUri}`);

      // Seed initial demo data
      try {
        const seedInMemory = require('../scripts/seedInMemory');
        await seedInMemory();
      } catch (seedErr) {
        console.warn(`Warning during initial seeding: ${seedErr.message}`);
      }

      return conn;
    } catch (memErr) {
      console.error(`❌ Fatal: Failed to initialize in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('🔌 MongoDB disconnected gracefully.');
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
