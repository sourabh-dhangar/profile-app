const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { generateToken } = require('../utils/jwt');

// Test runner
async function runVerification() {
  console.log('🧪 Starting Full Automated Verification Protocol...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas.');

  const db = mongoose.connection.db;
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  // TEST SUITE 1: Database Baseline & Cleanup Verification
  console.log('\n--- 1. Database Cleanup Verification ---');
  const userCount = await db.collection('users').countDocuments();
  const profileCount = await db.collection('profiles').countDocuments();
  const reelCount = await db.collection('reels').countDocuments();
  const sectionCount = await db.collection('sections').countDocuments();

  assert(userCount === 11, `User collection has exactly 11 preserved accounts (actual: ${userCount})`);
  assert(profileCount === 11, `Profile collection has exactly 11 showcase profiles (actual: ${profileCount})`);
  assert(reelCount >= 10 && reelCount <= 20, `Reels collection has pristine showcase reels (actual: ${reelCount})`);
  assert(sectionCount >= 30, `Sections collection has genuine modular portfolio data (actual: ${sectionCount})`);

  // Check admin and showcase accounts exist
  const adminProfile = await db.collection('profiles').findOne({ username: 'admin' });
  const adminUser = await db.collection('users').findOne({ mobile: '+919999999999' });
  assert(adminProfile && adminUser, 'Admin profile and user (+919999999999) exist');
  assert(adminUser.role === 'admin', 'Admin user role is admin');
  assert(adminProfile.userId.equals(adminUser._id), 'Admin profile is correctly linked to admin user');

  const sourabhProfile = await db.collection('profiles').findOne({ username: 'sourabh' });
  const sourabhDhangarProfile = await db.collection('profiles').findOne({ username: 'sourabh-dhangar' });
  assert(sourabhProfile && sourabhDhangarProfile, 'Personal profiles sourabh and sourabh-dhangar are preserved');

  const rahulProfile = await db.collection('profiles').findOne({ username: 'rahul_dev' });
  const rahulUser = await db.collection('users').findOne({ mobile: '+919876543210' });
  assert(rahulProfile && rahulUser && rahulProfile.userId.equals(rahulUser._id), 'Showcase creator rahul_dev is preserved and cleanly linked');

  // TEST SUITE 2: Creator Ownership & Editing Verification
  console.log('\n--- 2. Creator Ownership & Editing API Verification ---');
  // Find a reel belonging to sourabh
  const sourabhReel = await db.collection('reels').findOne({ profileId: sourabhProfile._id });
  assert(sourabhReel !== null, 'Found showcase reel belonging to sourabh');

  const sourabhUser = await db.collection('users').findOne({ _id: sourabhProfile.userId });
  const sourabhToken = generateToken({ userId: sourabhUser._id, role: sourabhUser.role });
  const rahulToken = generateToken({ userId: rahulUser._id, role: rahulUser.role });
  const adminToken = generateToken({ userId: adminUser._id, role: adminUser.role });

  // We test the controller functions directly via mock req/res
  const reelController = require('../controllers/reelController');

  // Test 2.1: Author updates reel caption and visibility
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  const originalCaption = sourabhReel.caption;
  const updateReq = {
    params: { id: sourabhReel._id.toString() },
    body: { caption: 'Updated caption by author testing creator ownership ✨', visibility: 'public' },
    user: sourabhUser,
  };
  const updateRes = mockRes();
  await reelController.updateReel(updateReq, updateRes, (err) => { throw err; });

  assert(updateRes.statusCode === 200 && updateRes.body.success, 'Creator can successfully update their own reel caption');
  assert(updateRes.body.data.caption.includes('Updated caption by author'), 'Reel caption was updated in DB');

  // Test 2.2: Another creator (rahul) tries to edit sourabh's reel -> should fail 403
  const unauthorizedReq = {
    params: { id: sourabhReel._id.toString() },
    body: { caption: 'Hacked caption by non-author' },
    user: rahulUser,
  };
  const unauthorizedRes = mockRes();
  await reelController.updateReel(unauthorizedReq, unauthorizedRes, (err) => { throw err; });

  assert(unauthorizedRes.statusCode === 403, 'Non-owner is blocked with 403 Forbidden when trying to edit reel');

  // Test 2.3: Admin edits the reel -> should succeed 200
  const adminEditReq = {
    params: { id: sourabhReel._id.toString() },
    body: { caption: originalCaption }, // restore original caption
    user: adminUser,
  };
  const adminEditRes = mockRes();
  await reelController.updateReel(adminEditReq, adminEditRes, (err) => { throw err; });

  assert(adminEditRes.statusCode === 200, 'Super admin can edit or moderate reel');

  // TEST SUITE 3: Super Admin Moderation & Feed Exclusions
  console.log('\n--- 3. Super Admin Moderation Verification ---');
  const adminController = require('../controllers/adminController');

  // Test 3.1: Admin lists all reels
  const listReq = { query: { page: 1, limit: 50 }, user: adminUser };
  const listRes = mockRes();
  await adminController.getAdminReels(listReq, listRes, (err) => { throw err; });

  assert(listRes.statusCode === 200 && listRes.body.success, 'Admin getAdminReels returns successfully');
  assert(listRes.body.data.reels.length === reelCount, `Admin list includes all ${reelCount} platform reels`);

  // Test 3.2: Admin suspends reel (taken_down)
  const suspendReelReq = {
    params: { id: sourabhReel._id.toString() },
    body: { status: 'taken_down', reason: 'Automated test suspension' },
    user: adminUser,
  };
  const suspendReelRes = mockRes();
  await adminController.updateReelStatus(suspendReelReq, suspendReelRes, (err) => { throw err; });

  assert(suspendReelRes.statusCode === 200 && suspendReelRes.body.data.status === 'taken_down', 'Admin can set reel status to taken_down');

  // Verify suspended reel disappears from public feed
  const feedReq1 = { query: { limit: 50 } };
  const feedRes1 = mockRes();
  await reelController.getFeed(feedReq1, feedRes1, (err) => { throw err; });

  const feedReelIds1 = feedRes1.body.data.reels.map(r => r._id.toString());
  assert(!feedReelIds1.includes(sourabhReel._id.toString()), 'Suspended reel is excluded from public discovery feed');

  // Test 3.3: Admin restores reel (active)
  const restoreReelReq = {
    params: { id: sourabhReel._id.toString() },
    body: { status: 'active', reason: 'Restoring verified reel' },
    user: adminUser,
  };
  const restoreReelRes = mockRes();
  await adminController.updateReelStatus(restoreReelReq, restoreReelRes, (err) => { throw err; });

  assert(restoreReelRes.statusCode === 200 && restoreReelRes.body.data.status === 'active', 'Admin can restore reel status to active');

  // Verify restored reel reappears in public feed
  const feedRes2 = mockRes();
  await reelController.getFeed(feedReq1, feedRes2, (err) => { throw err; });
  const feedReelIds2 = feedRes2.body.data.reels.map(r => r._id.toString());
  assert(feedReelIds2.includes(sourabhReel._id.toString()), 'Restored reel is visible in public discovery feed');

  // Test 3.4: Account suspension hides user content and blocks auth
  const suspendUserReq = {
    params: { id: sourabhUser._id.toString() },
    body: { accountStatus: 'suspended' },
    user: adminUser,
  };
  const suspendUserRes = mockRes();
  await adminController.updateUserStatus(suspendUserReq, suspendUserRes, (err) => { throw err; });
  assert(suspendUserRes.statusCode === 200 && suspendUserRes.body.data.accountStatus === 'suspended', 'Admin can suspend user account');

  // Verify feed excludes all reels from the suspended user
  const feedRes3 = mockRes();
  await reelController.getFeed(feedReq1, feedRes3, (err) => { throw err; });
  const feedReelIds3 = feedRes3.body.data.reels.map(r => r._id.toString());
  assert(!feedReelIds3.includes(sourabhReel._id.toString()), 'All reels from suspended user account are hidden from public feed');

  // Verify authentication middleware blocks suspended user
  const authMiddleware = require('../middleware/auth').authenticate;
  const authReq = {
    headers: { authorization: `Bearer ${sourabhToken}` },
  };
  const authRes = mockRes();
  let nextCalled = false;
  await authMiddleware(authReq, authRes, () => { nextCalled = true; });
  assert(!nextCalled && authRes.statusCode === 403, 'Suspended user JWT is rejected with 403 Account Suspended');

  // Restore user account back to active
  const restoreUserReq = {
    params: { id: sourabhUser._id.toString() },
    body: { accountStatus: 'active' },
    user: adminUser,
  };
  const restoreUserRes = mockRes();
  await adminController.updateUserStatus(restoreUserReq, restoreUserRes, (err) => { throw err; });
  assert(restoreUserRes.statusCode === 200 && restoreUserRes.body.data.accountStatus === 'active', 'Admin can reactivate user account');

  console.log('\n=======================================');
  console.log(`🏁 Verification Results: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=======================================');

  await mongoose.disconnect();
  if (failedCount > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
