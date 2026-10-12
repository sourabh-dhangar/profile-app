const TestClient = require('./test-client');

async function runTier3Tests() {
  console.log('\n=== RUNNING TIER 3: CROSS-FEATURE LIFECYCLE FLOW TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // FLOW 1: Full Creator Onboarding, Publication, and QR Flow
    // -------------------------------------------------------------
    console.log('\n--- Flow 1: Creator Onboarding & Publication ---');
    const creatorPhone = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const creatorClient = new TestClient('http://localhost:5000');

    // 1. Request OTP & Verify
    await creatorClient.post('/api/v1/auth/request-otp', { mobile: creatorPhone });
    const verifyRes = await creatorClient.post('/api/v1/auth/verify-otp', { mobile: creatorPhone, otp: '123456' });
    creatorClient.setToken(verifyRes.data.data.token);

    // 2. Set Profile Details
    const creatorSlug = 'designer_' + Date.now().toString(36);
    await creatorClient.put('/api/v1/profiles/me', {
      name: 'Design Prodigy',
      username: creatorSlug,
      bio: 'Leading visual designer with a passion for clean UI.',
      profileType: 'Freelancer',
      city: 'Delhi',
      contactDetails: { email: 'designer@example.com', showEmail: true },
    });

    // 3. Add Sections
    await creatorClient.post('/api/v1/profiles/me/sections', {
      type: 'services',
      title: 'Design Offerings',
      content: { items: ['Brand Guidelines', 'Mobile UI Design', 'Web Design'] },
      visibility: 'public',
    });

    // 4. Publish Profile
    const publishRes = await creatorClient.post('/api/v1/profiles/me/publish');
    assert(publishRes.status === 200 && publishRes.data.data.status === 'published', 'Flow 1: Profile published successfully');
    assert(!!publishRes.data.data.qrCodeUrl, 'Flow 1: QR code automatically generated on publish');

    // 5. Verify Public Profile & QR endpoint
    const pubClient = new TestClient('http://localhost:5000');
    const pubRes = await pubClient.get(`/api/v1/profiles/${creatorSlug}`);
    assert(pubRes.status === 200 && pubRes.data.data.profile.name === 'Design Prodigy', 'Flow 1: Public profile resolves published details');

    const qrRes = await pubClient.get(`/api/v1/profiles/${creatorSlug}/qr`);
    assert(qrRes.status === 200 && !!qrRes.data.data.qrCode, 'Flow 1: Profile QR code endpoint returns valid data URL');


    // -------------------------------------------------------------
    // FLOW 2: Content Moderation & Takedown Flow
    // -------------------------------------------------------------
    console.log('\n--- Flow 2: Content Moderation & Takedown ---');

    // 1. Creator posts a reel
    const postReelRes = await creatorClient.post('/api/v1/reels', {
      videoUrl: 'https://example.com/test-moderation-reel.mp4',
      caption: 'Questionable video to test moderation takedown',
      durationSeconds: 10,
    });
    const testReelId = postReelRes.data.data._id;
    assert(!!testReelId, 'Flow 2: Reel created by creator');

    // 2. Viewer reports the reel
    const reportRes = await pubClient.post('/api/v1/reports', {
      targetType: 'reel',
      targetId: testReelId,
      reason: 'Violates community standards',
    });
    const reportId = reportRes.data.data._id;
    assert(reportRes.status === 201 && !!reportId, 'Flow 2: Reel reported by viewer');

    // 3. Admin logs in
    const adminClient = new TestClient('http://localhost:5000');
    await adminClient.post('/api/v1/auth/request-otp', { mobile: '9999999999' });
    const adminAuth = await adminClient.post('/api/v1/auth/verify-otp', { mobile: '9999999999', otp: '123456' });
    adminClient.setToken(adminAuth.data.data.token);

    // 4. Admin reviews report & applies takedown
    const takedownRes = await adminClient.put(`/api/v1/admin/reports/${reportId}`, {
      status: 'resolved',
      actionTaken: 'takedown',
      adminNotes: 'Confirmed violation. Reel removed.',
    });
    assert(takedownRes.status === 200 && takedownRes.data.data.actionTaken === 'takedown', 'Flow 2: Admin successfully executes takedown on reported reel');

    // 5. Verify reel is no longer accessible
    const fetchTakenDownReel = await pubClient.get(`/api/v1/reels/${testReelId}`);
    assert(fetchTakenDownReel.status === 404, 'Flow 2: Takedown reel returns 404 to public viewers');


    // -------------------------------------------------------------
    // FLOW 3: User Suspension & Access Revocation
    // -------------------------------------------------------------
    console.log('\n--- Flow 3: User Account Suspension ---');
    const creatorUserId = verifyRes.data.data.user.id;

    // 1. Admin suspends creator user
    const suspendRes = await adminClient.put(`/api/v1/admin/users/${creatorUserId}/status`, {
      accountStatus: 'suspended',
    });
    assert(suspendRes.status === 200 && suspendRes.data.data.accountStatus === 'suspended', 'Flow 3: Admin suspends creator user account');

    // 2. Suspended creator attempts authenticated call
    const suspendedAttempt = await creatorClient.get('/api/v1/profiles/me');
    assert(suspendedAttempt.status === 403 && suspendedAttempt.data.message.includes('suspended'), 'Flow 3: Suspended user is blocked with 403 Forbidden on authenticated endpoints');

  } catch (err) {
    console.error('Tier 3 unexpected error:', err);
    failed++;
  }

  console.log(`\nTier 3 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier3Tests;

if (require.main === module) {
  runTier3Tests();
}
