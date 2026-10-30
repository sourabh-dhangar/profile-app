const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function testEdgeCases() {
  console.log('🧪 Starting Edge Case Verification Protocol...');
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const reelController = require('../controllers/reelController');
  const adminController = require('../controllers/adminController');
  const authController = require('../controllers/authController');

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

  const sourabhProfile = await db.collection('profiles').findOne({ username: 'sourabh' });
  const sourabhUser = await db.collection('users').findOne({ _id: sourabhProfile.userId });
  const sourabhReel = await db.collection('reels').findOne({ profileId: sourabhProfile._id });

  // Edge Case 1: Caption exceeding 300 characters
  console.log('\n--- Edge Case 1: Boundary value validation (Caption > 300 chars) ---');
  const longCaption = 'A'.repeat(301);
  const longCaptionReq = {
    params: { id: sourabhReel._id.toString() },
    body: { caption: longCaption },
    user: sourabhUser,
  };
  const longCaptionRes = mockRes();
  await reelController.updateReel(longCaptionReq, longCaptionRes, (err) => { throw err; });
  assert(longCaptionRes.statusCode === 400, 'Rejects caption longer than 300 chars with 400 Bad Request');

  // Edge Case 2: Invalid visibility value
  console.log('\n--- Edge Case 2: Invalid visibility enum value ---');
  const invalidVisReq = {
    params: { id: sourabhReel._id.toString() },
    body: { visibility: 'super-secret' },
    user: sourabhUser,
  };
  const invalidVisRes = mockRes();
  await reelController.updateReel(invalidVisReq, invalidVisRes, (err) => { throw err; });
  assert(invalidVisRes.statusCode === 400, 'Rejects invalid visibility enum value with 400 Bad Request');

  // Edge Case 3: Update non-existent reel ID
  console.log('\n--- Edge Case 3: Non-existent reel ID ---');
  const nonExistentId = new mongoose.Types.ObjectId().toString();
  const nonExistentReq = {
    params: { id: nonExistentId },
    body: { caption: 'Valid caption' },
    user: sourabhUser,
  };
  const nonExistentRes = mockRes();
  await reelController.updateReel(nonExistentReq, nonExistentRes, (err) => { throw err; });
  assert(nonExistentRes.statusCode === 404, 'Returns 404 Not Found for non-existent reel ID');

  // Edge Case 4: Admin sets invalid reel status
  console.log('\n--- Edge Case 4: Admin invalid status value ---');
  const adminUser = await db.collection('users').findOne({ mobile: '+919999999999' });
  const adminInvalidStatusReq = {
    params: { id: sourabhReel._id.toString() },
    body: { status: 'deleted_forever' },
    user: adminUser,
  };
  const adminInvalidStatusRes = mockRes();
  await adminController.updateReelStatus(adminInvalidStatusReq, adminInvalidStatusRes, (err) => { throw err; });
  assert(adminInvalidStatusRes.statusCode === 400, 'Rejects invalid moderation status with 400 Bad Request');

  // Edge Case 5: Admin modifies non-existent reel status
  console.log('\n--- Edge Case 5: Admin status on non-existent reel ---');
  const adminNonExistentReq = {
    params: { id: nonExistentId },
    body: { status: 'taken_down' },
    user: adminUser,
  };
  const adminNonExistentRes = mockRes();
  await adminController.updateReelStatus(adminNonExistentReq, adminNonExistentRes, (err) => { throw err; });
  assert(adminNonExistentRes.statusCode === 404, 'Returns 404 Not Found when moderating non-existent reel');

  // Edge Case 6: Suspended account blocked during OTP verify
  console.log('\n--- Edge Case 6: Suspended user OTP verify rejection ---');
  // Temporarily suspend user
  await db.collection('users').updateOne({ _id: sourabhUser._id }, {
    $set: {
      accountStatus: 'suspended',
      otp: { code: '123456', expiresAt: new Date(Date.now() + 60000), attempts: 0 }
    }
  });

  const otpVerifyReq = {
    body: { mobile: sourabhUser.mobile, otp: '123456' }
  };
  const otpVerifyRes = mockRes();
  await authController.verifyOtp(otpVerifyReq, otpVerifyRes, (err) => { throw err; });
  assert(otpVerifyRes.statusCode === 403, 'Suspended account is blocked with 403 during verifyOtp');

  // Restore user back to active
  await db.collection('users').updateOne({ _id: sourabhUser._id }, {
    $set: { accountStatus: 'active', otp: undefined }
  });

  console.log('\n=======================================');
  console.log(`🏁 Edge Case Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================');

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
}

testEdgeCases().catch((err) => {
  console.error('Edge case tests failed:', err);
  process.exit(1);
});
