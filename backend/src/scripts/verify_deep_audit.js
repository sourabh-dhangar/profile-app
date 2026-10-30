const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function runDeepAudit() {
  console.log('🧪 Starting Deep Audit & Robustness Verification Protocol...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas.');

  const db = mongoose.connection.db;
  const reelController = require('../controllers/reelController');
  const adminController = require('../controllers/adminController');
  const authController = require('../controllers/authController');
  const profileController = require('../controllers/profileController');
  const discoveryController = require('../controllers/discoveryController');
  const Comment = require('../models/Comment');
  const Bookmark = require('../models/Bookmark');
  const Reel = require('../models/Reel');
  const User = require('../models/User');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

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

  const adminProfile = await db.collection('profiles').findOne({ username: 'admin' });
  const adminUser = await db.collection('users').findOne({ mobile: '+919999999999' });
  const sourabhProfile = await db.collection('profiles').findOne({ username: 'sourabh' });
  const sourabhUser = await db.collection('users').findOne({ _id: sourabhProfile.userId });
  const rahulProfile = await db.collection('profiles').findOne({ username: 'rahul_dev' });
  const rahulUser = await db.collection('users').findOne({ mobile: '+919876543210' });

  // --- Audit 1: Root admin and self-suspension protection ---
  console.log('\n--- Audit 1: Root Admin & Self-Suspension Safeguards ---');
  const rootAdminSuspendReq = {
    params: { id: adminUser._id.toString() },
    body: { accountStatus: 'suspended' },
    user: adminUser,
  };
  const rootAdminSuspendRes = mockRes();
  await adminController.updateUserStatus(rootAdminSuspendReq, rootAdminSuspendRes, (err) => { throw err; });
  assert(rootAdminSuspendRes.statusCode === 400 && rootAdminSuspendRes.body.message.includes('platform administrator'), 'Blocks suspension of root platform administrator (+919999999999)');

  // Test self-suspension with another admin
  const mockSubAdmin = { _id: new mongoose.Types.ObjectId(), mobile: '+919888888888', role: 'admin' };
  const selfAdminSuspendReq = {
    params: { id: mockSubAdmin._id.toString() },
    body: { accountStatus: 'suspended' },
    user: mockSubAdmin,
  };
  // Temporarily insert subAdmin
  await db.collection('users').insertOne({ _id: mockSubAdmin._id, mobile: mockSubAdmin.mobile, role: 'admin', accountStatus: 'active' });
  const selfAdminSuspendRes = mockRes();
  await adminController.updateUserStatus(selfAdminSuspendReq, selfAdminSuspendRes, (err) => { throw err; });
  assert(selfAdminSuspendRes.statusCode === 400 && selfAdminSuspendRes.body.message.includes('cannot suspend their own account'), 'Blocks administrator from suspending their own account');
  await db.collection('users').deleteOne({ _id: mockSubAdmin._id });

  // --- Audit 2: Deactivated and suspended user OTP requests & verify ---
  console.log('\n--- Audit 2: Auth Flow Account Status Enforcement (Deactivated / Suspended) ---');
  const testPhone = '+919111122222';
  const testDeactivatedUser = await db.collection('users').insertOne({
    mobile: testPhone,
    accountStatus: 'deactivated',
    isVerified: true,
  });

  const otpReqReq = {
    body: { mobile: testPhone, mode: 'signin' },
  };
  const otpReqRes = mockRes();
  await authController.requestOtp(otpReqReq, otpReqRes, (err) => { throw err; });
  assert(otpReqRes.statusCode === 403 && otpReqRes.body.message.includes('deactivated'), 'Blocks deactivated account from requesting OTP');

  const otpVerReq = {
    body: { mobile: testPhone, otp: '123456' },
  };
  const otpVerRes = mockRes();
  await authController.verifyOtp(otpVerReq, otpVerRes, (err) => { throw err; });
  assert(otpVerRes.statusCode === 403 && otpVerRes.body.message.includes('deactivated'), 'Blocks deactivated account from verifying OTP');
  await db.collection('users').deleteOne({ _id: testDeactivatedUser.insertedId });

  // --- Audit 3: Creator Ownership & Cascading Deletion on Reel Delete ---
  console.log('\n--- Audit 3: Creator Ownership on Delete & Cascade Cleanup ---');
  // Create a temporary test reel for sourabh
  const tempReel = await Reel.create({
    profileId: sourabhProfile._id,
    caption: 'Temporary test reel for cascade deletion audit',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    visibility: 'public',
    status: 'active',
  });

  // Attach a mock comment and bookmark
  await Comment.create({
    reelId: tempReel._id,
    userId: rahulUser._id,
    profileId: rahulProfile._id,
    text: 'Test comment to verify cascade cleanup',
  });
  await Bookmark.create({
    userId: rahulUser._id,
    reelId: tempReel._id,
  });

  // Unauthorized peer attempts to delete sourabh's reel
  const unauthDelReq = {
    params: { id: tempReel._id.toString() },
    user: rahulUser,
  };
  const unauthDelRes = mockRes();
  await reelController.deleteReel(unauthDelReq, unauthDelRes, (err) => { throw err; });
  assert(unauthDelRes.statusCode === 403, 'Unauthorized peer is blocked with 403 when attempting to delete reel');

  // Creator deletes their own reel
  const authDelReq = {
    params: { id: tempReel._id.toString() },
    user: sourabhUser,
  };
  const authDelRes = mockRes();
  await reelController.deleteReel(authDelReq, authDelRes, (err) => { throw err; });
  assert(authDelRes.statusCode === 200, 'Creator can successfully delete their own reel');

  // Confirm reel, comments, and bookmarks were cascade deleted
  const deletedReelCheck = await Reel.findById(tempReel._id);
  const commentCheck = await Comment.findOne({ reelId: tempReel._id });
  const bookmarkCheck = await Bookmark.findOne({ reelId: tempReel._id });
  assert(!deletedReelCheck, 'Reel is removed from MongoDB');
  assert(!commentCheck, 'Associated comments are cascade deleted');
  assert(!bookmarkCheck, 'Associated bookmarks are cascade deleted');

  // --- Audit 4: updateReelVisibility ownership enforcement ---
  console.log('\n--- Audit 4: Visibility Update Ownership Enforcement ---');
  const sourabhReel = await Reel.findOne({ profileId: sourabhProfile._id });
  const unauthVisReq = {
    params: { id: sourabhReel._id.toString() },
    body: { visibility: 'private' },
    user: rahulUser,
  };
  const unauthVisRes = mockRes();
  await reelController.updateReelVisibility(unauthVisReq, unauthVisRes, (err) => { throw err; });
  assert(unauthVisRes.statusCode === 403, 'Unauthorized user is blocked with 403 when updating visibility');

  const authVisReq = {
    params: { id: sourabhReel._id.toString() },
    body: { visibility: 'profile-only' },
    user: sourabhUser,
  };
  const authVisRes = mockRes();
  await reelController.updateReelVisibility(authVisReq, authVisRes, (err) => { throw err; });
  assert(authVisRes.statusCode === 200, 'Owner can successfully update reel visibility to profile-only');

  // Restore back to public
  const restoreVisReq = {
    params: { id: sourabhReel._id.toString() },
    body: { visibility: 'public' },
    user: sourabhUser,
  };
  const restoreVisRes = mockRes();
  await reelController.updateReelVisibility(restoreVisReq, restoreVisRes, (err) => { throw err; });
  assert(restoreVisRes.statusCode === 200, 'Owner can restore reel visibility to public');

  // --- Audit 5: Public profile hides suspended accounts & shows profile-only reels ---
  console.log('\n--- Audit 5: Public Profile Isolation for Suspended Accounts & Profile-Only Reels ---');
  // Temporarily suspend rahul
  await db.collection('users').updateOne({ _id: rahulUser._id }, { $set: { accountStatus: 'suspended' } });
  const pubProfReq1 = { params: { username: 'rahul_dev' } };
  const pubProfRes1 = mockRes();
  await profileController.getPublicProfile(pubProfReq1, pubProfRes1, (err) => { throw err; });
  assert(pubProfRes1.statusCode === 404, 'Public profile returns 404 when author account is suspended');

  // Restore rahul
  await db.collection('users').updateOne({ _id: rahulUser._id }, { $set: { accountStatus: 'active' } });
  const pubProfRes2 = mockRes();
  await profileController.getPublicProfile(pubProfReq1, pubProfRes2, (err) => { throw err; });
  assert(pubProfRes2.statusCode === 200, 'Public profile returns 200 when author account is active');

  // --- Audit 6: Video Streaming Protection for Taken-Down Reels ---
  console.log('\n--- Audit 6: Video Streaming Protection for Moderated Media ---');
  // Suspend sourabh reel
  await Reel.findByIdAndUpdate(sourabhReel._id, { status: 'taken_down' });
  const streamReq = { params: { id: sourabhReel._id.toString() }, headers: {} };
  const streamRes = mockRes();
  await reelController.streamReelVideo(streamReq, streamRes, (err) => { throw err; });
  assert(streamRes.statusCode === 403, 'Streaming a taken-down reel is rejected with 403 Forbidden');
  // Restore
  await Reel.findByIdAndUpdate(sourabhReel._id, { status: 'active' });

  // --- Audit 7: Discovery Browse Filters Out Suspended Creators ---
  console.log('\n--- Audit 7: Discovery Browse Filtering Suspended Creators ---');
  // Temporarily suspend rahul
  await db.collection('users').updateOne({ _id: rahulUser._id }, { $set: { accountStatus: 'suspended' } });
  const browseReq = { query: { category: 'All' } };
  const browseRes = mockRes();
  await discoveryController.browseProfiles(browseReq, browseRes, (err) => { throw err; });
  const browseUsernames = browseRes.body.data.profiles.map(p => p.username);
  assert(!browseUsernames.includes('rahul_dev'), 'Suspended creators are excluded from discovery browse results');
  // Restore rahul
  await db.collection('users').updateOne({ _id: rahulUser._id }, { $set: { accountStatus: 'active' } });

  // --- Audit 8: Admin Reel Search by Creator Username ---
  console.log('\n--- Audit 8: Admin Search by Creator Username / Handle ---');
  const adminSearchReq = { query: { search: 'rahul_dev' }, user: adminUser };
  const adminSearchRes = mockRes();
  await adminController.getAdminReels(adminSearchReq, adminSearchRes, (err) => { throw err; });
  assert(adminSearchRes.statusCode === 200, 'Admin search query returns successfully');
  const foundReels = adminSearchRes.body.data.reels;
  assert(foundReels.length > 0 && foundReels.some(r => r.profileId?.username === 'rahul_dev'), 'Admin search by creator handle finds creator reels');

  console.log('\n=======================================');
  console.log(`🏁 Deep Audit Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================');

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
}

runDeepAudit().catch((err) => {
  console.error('❌ Deep audit failed:', err);
  process.exit(1);
});
