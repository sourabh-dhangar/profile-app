const mongoose = require('mongoose');
const config = require('../src/config/env');

async function fixMobileIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected.');

    const collection = mongoose.connection.collection('users');
    const indexesBefore = await collection.indexes();
    console.log('Indexes before fix:', indexesBefore.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse })));

    // Check if mobile_1 exists
    const hasMobileIndex = indexesBefore.some(i => i.name === 'mobile_1');
    if (hasMobileIndex) {
      console.log('Dropping faulty mobile_1 index...');
      await collection.dropIndex('mobile_1');
      console.log('mobile_1 index dropped successfully.');
    }

    // Clean up any empty string mobile or null mobile on existing docs
    console.log('Sanitizing mobile fields on users (removing null / empty string)...');
    const updateNullRes = await collection.updateMany(
      { mobile: { $in: [null, ''] } },
      { $unset: { mobile: '' } }
    );
    console.log(`Updated ${updateNullRes.modifiedCount} user documents.`);

    // Recreate mobile index with sparse and partialFilterExpression
    console.log('Creating sparse unique index on mobile...');
    await collection.createIndex(
      { mobile: 1 },
      {
        name: 'mobile_1',
        unique: true,
        sparse: true,
        background: true,
      }
    );
    console.log('New mobile_1 index created successfully!');

    const indexesAfter = await collection.indexes();
    console.log('Indexes after fix:', indexesAfter.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse, partialFilterExpression: i.partialFilterExpression })));

  } catch (err) {
    console.error('Error during index fix:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
}

fixMobileIndex();
