const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const Profile = require('../models/Profile');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for email authentication migration...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB successfully.');

    const usersCollection = mongoose.connection.collection('users');

    // 1. Manage indexes
    console.log('Inspecting collection indexes...');
    const indexes = await usersCollection.indexes();
    console.log('Existing indexes:', indexes.map(i => i.name));

    // Drop unique constraint on mobile if it exists
    if (indexes.some(i => i.name === 'mobile_1')) {
      console.log('Dropping old mobile_1 unique index...');
      try {
        await usersCollection.dropIndex('mobile_1');
        console.log('Dropped mobile_1 index.');
      } catch (e) {
        console.warn('Could not drop mobile_1 index:', e.message);
      }
    }

    // Drop dangerous TTL index on otp.expiresAt if it exists
    if (indexes.some(i => i.name === 'otp.expiresAt_1')) {
      console.log('Dropping otp.expiresAt_1 TTL index to protect user data...');
      try {
        await usersCollection.dropIndex('otp.expiresAt_1');
        console.log('Dropped otp.expiresAt_1 index.');
      } catch (e) {
        console.warn('Could not drop otp.expiresAt_1 index:', e.message);
      }
    }

    // Ensure email index is unique
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: false });
      console.log('Created unique index on email.');
    } catch (e) {
      console.log('Email index notice:', e.message);
    }

    // 2. Fetch and migrate all users
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users to migrate.`);

    const defaultAdminPassHash = await bcrypt.hash('Admin@myprofile2026!', 10);
    const defaultCreatorPassHash = await bcrypt.hash('Creator@2026!', 10);

    let adminMigrated = false;
    const migratedList = [];

    for (const user of allUsers) {
      const profile = await Profile.findOne({ userId: user._id });
      const isAdmin = user.role === 'admin' || user.mobile === '+919999999999' || profile?.username === 'admin';

      let targetEmail = '';
      let targetPasswordHash = '';
      let targetRole = user.role || 'user';

      if (isAdmin && !adminMigrated) {
        targetEmail = 'admin@myprofile.com';
        targetPasswordHash = defaultAdminPassHash;
        targetRole = 'admin';
        adminMigrated = true;
      } else {
        const profileEmail = profile?.contactDetails?.email?.trim()?.toLowerCase();
        if (profileEmail && profileEmail !== 'admin@myprofile.com') {
          targetEmail = profileEmail;
        } else if (user.mobile === '+917489553373') {
          targetEmail = 'sourabh@myprofile.com';
        } else {
          const slug = profile?.username || `user_${user._id.toString().substring(18)}`;
          targetEmail = `${slug}@myprofile.com`;
        }
        targetPasswordHash = defaultCreatorPassHash;
      }

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            email: targetEmail.toLowerCase().trim(),
            password: targetPasswordHash,
            role: targetRole,
            isVerified: true,
            accountStatus: user.accountStatus || 'active',
            name: profile?.name || user.name || 'MyProfile Member',
          },
          $unset: {
            otp: '',
          },
        }
      );

      // If profile exists, ensure contactDetails has the email
      if (profile) {
        await Profile.updateOne(
          { _id: profile._id },
          {
            $set: {
              'contactDetails.email': targetEmail.toLowerCase().trim(),
              'contactDetails.showEmail': true,
            },
          }
        );
      }

      migratedList.push({
        id: user._id.toString(),
        name: profile?.name || 'User',
        email: targetEmail,
        role: targetRole,
      });
    }

    console.log('\n--- Migration Completed Successfully ---');
    console.table(migratedList);

    console.log('\nDefault Admin Credentials:');
    console.log('Email: admin@myprofile.com');
    console.log('Password: Admin@myprofile2026!');

    console.log('\nDefault Creator Credentials:');
    console.log('Password: Creator@2026!');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
