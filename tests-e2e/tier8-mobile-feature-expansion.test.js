const TestClient = require('./test-client');

async function runTier8Tests() {
  console.log('\n=== RUNNING TIER 8: MOBILE FEATURE EXPANSION & INTEGRATION TESTS ===\n');
  const client = new TestClient('http://localhost:5000');
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
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const testMobile = `9888${randomSuffix}`;
    const testUsername = `mob_dev_${Date.now().toString(36)}`;

    // 1. Authenticate mobile session
    await client.post('/api/v1/auth/request-otp', { mobile: testMobile });
    const authRes = await client.post('/api/v1/auth/verify-otp', { mobile: testMobile, otp: '123456' });
    assert(authRes.status === 200, 'Mobile authentication returns HTTP 200');

    const token = authRes.data.data.token;
    client.setToken(token);

    // Initialize mobile profile
    const profRes = await client.put('/api/v1/profiles/me', {
      name: 'Mobile Engineer Test',
      username: testUsername,
      profileType: 'Creator',
      bio: 'Mobile Section Manager & Inquiries CRM Testing',
      city: 'Hyderabad',
    });
    assert(profRes.status === 200, 'Mobile profile initialized');

    // Publish profile so inquiries and public views work
    await client.post('/api/v1/profiles/me/publish');

    // 2. Mobile Section Creation
    const secCreateRes = await client.post('/api/v1/sections', {
      type: 'skills',
      title: 'Mobile Architecture Stacks',
      content: { items: ['React Native', 'Expo', 'Redux', 'Fastlane'] },
    });
    assert(secCreateRes.status === 201, 'Mobile Section created via POST /api/v1/sections (201 Created)');
    assert(secCreateRes.data.success === true, 'Section creation returns success: true');
    const createdSecId = secCreateRes.data.data?._id;

    // 3. Mobile Section Retrieval
    const secGetRes = await client.get('/api/v1/sections');
    assert(secGetRes.status === 200, 'Mobile Sections retrieved via GET /api/v1/sections (200 OK)');
    assert(
      Array.isArray(secGetRes.data.data) && secGetRes.data.data.some((s) => s._id === createdSecId),
      'Created section found in mobile sections list'
    );

    // 4. Mobile Section Update
    const secUpdateRes = await client.put(`/api/v1/sections/${createdSecId}`, {
      title: 'Advanced Mobile Engineering',
      content: { items: ['React Native', 'Expo', 'Turbomodules', 'JSI'] },
    });
    assert(secUpdateRes.status === 200, 'Mobile Section updated via PUT /api/v1/sections/:id (200 OK)');
    assert(
      secUpdateRes.data.data.title === 'Advanced Mobile Engineering',
      'Updated section reflects new title'
    );

    // 5. Inquiries / Leads Submission from Visitor
    const visitorClient = new TestClient('http://localhost:5000');
    const visitorInqRes = await visitorClient.post(`/api/v1/profiles/${testUsername}/inquiries`, {
      name: 'Fintech Mobile Lead',
      email: 'lead@fintech.co',
      phone: '+919988776655',
      message: 'Looking for a senior React Native engineer to build a financial dashboard.',
    });
    assert(visitorInqRes.status === 201, 'Visitor inquiry submitted to mobile creator (201 Created)');
    const createdInqId = visitorInqRes.data.data?._id;

    // 6. Mobile Inquiries CRM Inbox Retrieval
    const inqGetRes = await client.get('/api/v1/profiles/me/inquiries');
    assert(inqGetRes.status === 200, 'Mobile inquiries CRM inbox retrieved via GET /api/v1/profiles/me/inquiries');
    assert(
      inqGetRes.data.data.inquiries.some((i) => i._id === createdInqId),
      'Inquiries list contains the new lead message'
    );

    // 7. Mobile Inquiry Status Update
    const inqUpdateRes = await client.put(`/api/v1/profiles/me/inquiries/${createdInqId}/status`, {
      status: 'contacted',
    });
    assert(inqUpdateRes.status === 200, 'Mobile inquiry status updated to contacted (200 OK)');
    assert(inqUpdateRes.data.data.status === 'contacted', 'Inquiry reflects contacted status');

    // 8. Mobile Performance Analytics
    const anaRes = await client.get('/api/v1/profiles/me/analytics');
    assert(anaRes.status === 200, 'Mobile analytics retrieved via GET /api/v1/profiles/me/analytics (200 OK)');
    assert(typeof anaRes.data.data.totalViews === 'number', 'Analytics returns numeric totalViews');

    // 9. QR Code Endpoint for Mobile Sharing Modal
    const qrRes = await visitorClient.get(`/api/v1/profiles/${testUsername}/qr`);
    assert(qrRes.status === 200, 'Mobile QR Code served via GET /api/v1/profiles/:username/qr (200 OK)');
    assert(
      qrRes.data.success === true && qrRes.data.data?.qrCode?.startsWith('data:image/png'),
      'QR Code response provides base64 image data URL'
    );

    // 10. Mobile Section Deletion
    const secDelRes = await client.delete(`/api/v1/sections/${createdSecId}`);
    assert(secDelRes.status === 200, 'Mobile Section deleted via DELETE /api/v1/sections/:id (200 OK)');

    // Verify deletion
    const secVerifyRes = await client.get('/api/v1/sections');
    assert(
      !secVerifyRes.data.data.some((s) => s._id === createdSecId),
      'Deleted section no longer appears in sections list'
    );

  } catch (err) {
    console.error('Tier 8 test execution encountered unexpected error:', err);
    failed++;
  }

  console.log(`\nTier 8 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = { runTier8Tests };

if (require.main === module) {
  const { startServer } = require('../backend/src/server');
  startServer().then(() => {
    runTier8Tests().then(({ failed }) => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
}
