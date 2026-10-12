const TestClient = require('./test-client');

async function runTier1Tests() {
  console.log('\n=== RUNNING TIER 1: FEATURE COVERAGE TESTS ===\n');
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
    // 1. Health check
    const health = await client.get('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Server health endpoint returns 200 OK');

    // 2. Auth: Request OTP
    const testPhone = '9123456789';
    const otpRes = await client.post('/api/v1/auth/request-otp', { mobile: testPhone });
    assert(otpRes.status === 200 && otpRes.data.success === true, 'Request OTP returns 200 success');
    assert(otpRes.data.data.devOtp === '123456', 'Dev mode OTP returns 123456 bypass code');

    // 3. Auth: Verify OTP
    const verifyRes = await client.post('/api/v1/auth/verify-otp', { mobile: testPhone, otp: '123456' });
    assert(verifyRes.status === 200 && verifyRes.data.data?.token, 'Verify OTP returns 200 and issues JWT token');
    const token = verifyRes.data.data.token;
    client.setToken(token);

    // 4. Auth: Get current user (/auth/me)
    const meRes = await client.get('/api/v1/auth/me');
    assert(meRes.status === 200 && meRes.data.data?.user?.mobile === '+91' + testPhone, 'Get authenticated user matches mobile number');

    // 5. Profile: Update profile details
    const uniqueSlug = 'tester_' + Date.now().toString(36);
    const updateProfileRes = await client.put('/api/v1/profiles/me', {
      name: 'Automated Tester',
      username: uniqueSlug,
      bio: 'Testing profile features thoroughly.',
      city: 'Hyderabad',
      profileType: 'Professional',
      contactDetails: { email: 'tester@example.com', showEmail: true },
    });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.data.username === uniqueSlug, 'Update profile sets username and bio');

    // 6. Profile: Check username availability
    const checkUserRes = await client.get(`/api/v1/profiles/check-username/${uniqueSlug}`);
    assert(checkUserRes.status === 200 && checkUserRes.data.data.available === false, 'Check username confirms taken slug is unavailable');

    // 7. Sections: Create section
    const createSecRes = await client.post('/api/v1/profiles/me/sections', {
      type: 'skills',
      title: 'Automation Skills',
      content: { items: ['Jest', 'Supertest', 'E2E Testing'] },
      visibility: 'public',
    });
    assert(createSecRes.status === 201 && createSecRes.data.data._id, 'Create section adds new modular block');
    const sectionId = createSecRes.data.data._id;

    // 8. Sections: List sections
    const listSecRes = await client.get('/api/v1/profiles/me/sections');
    assert(listSecRes.status === 200 && Array.isArray(listSecRes.data.data), 'List sections returns array of modular blocks');

    // 9. Sections: Update section
    const updateSecRes = await client.put(`/api/v1/profiles/me/sections/${sectionId}`, {
      title: 'Advanced Automation Skills',
    });
    assert(updateSecRes.status === 200 && updateSecRes.data.data.title === 'Advanced Automation Skills', 'Update section changes title');

    // 10. Profile: Publish Profile
    const pubRes = await client.post('/api/v1/profiles/me/publish');
    assert(pubRes.status === 200 && pubRes.data.data.status === 'published', 'Publish profile sets status to published');

    // 11. Profile: Public view
    const publicClient = new TestClient('http://localhost:5000');
    const publicProfileRes = await publicClient.get(`/api/v1/profiles/${uniqueSlug}`);
    assert(publicProfileRes.status === 200 && publicProfileRes.data.data.profile.name === 'Automated Tester', 'Public profile viewer returns published profile');

    // 12. Discovery: Enable phone discovery
    const enableDiscRes = await client.put('/api/v1/discovery/settings', { allowDiscovery: true });
    assert(enableDiscRes.status === 200 && enableDiscRes.data.data.allowDiscovery === true, 'Enable phone discovery updates opt-in setting');

    // 13. Discovery: Search by phone finds user
    const discMatchRes = await publicClient.post('/api/v1/discovery/search-by-phone', {
      phone: testPhone,
      countryCode: '+91',
    });
    assert(discMatchRes.status === 200 && discMatchRes.data.data.username === uniqueSlug, 'Search by phone returns matched profile for opted-in user');

    // 14. Reels: Create reel
    const reelRes = await client.post('/api/v1/reels', {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: 'Automated test reel demo #testing',
      durationSeconds: 15,
      visibility: 'public',
    });
    assert(reelRes.status === 201 && reelRes.data.data._id, 'Create reel successfully creates short video entry');
    const reelId = reelRes.data.data._id;

    // 15. Reels: Like and View
    const likeRes = await client.post(`/api/v1/reels/${reelId}/like`);
    assert(likeRes.status === 200 && likeRes.data.data.likesCount >= 1, 'Like reel increments likes count');

    const viewRes = await publicClient.post(`/api/v1/reels/${reelId}/view`);
    assert(viewRes.status === 200 && viewRes.data.data.viewsCount >= 1, 'View reel increments views count');

    // 16. Reports: File report
    const reportRes = await publicClient.post('/api/v1/reports', {
      targetType: 'reel',
      targetId: reelId,
      reason: 'Inappropriate content testing',
    });
    assert(reportRes.status === 201 && reportRes.data.success === true, 'Submit report files content moderation request');

  } catch (err) {
    console.error('Tier 1 unexpected error:', err);
    failed++;
  }

  console.log(`\nTier 1 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier1Tests;

if (require.main === module) {
  runTier1Tests();
}
