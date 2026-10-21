const TestClient = require('./test-client');

async function runTier7Tests() {
  console.log('\n=== RUNNING TIER 7: EXPANDED API & REELS/AI/PRIVACY ENDPOINT TESTS ===\n');
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
    // Setup: Create test creator user
    const testPhone = '9777' + Math.floor(100000 + Math.random() * 900000);
    await client.post('/api/v1/auth/request-otp', { mobile: testPhone });
    const verifyRes = await client.post('/api/v1/auth/verify-otp', { mobile: testPhone, otp: '123456' });
    const token = verifyRes.data.data.token;
    client.setToken(token);

    const testSlug = 'exp_user_' + Date.now().toString(36);

    // Initial Profile Setup
    const setupRes = await client.put('/api/v1/profiles/me', {
      name: 'Expansion Tester',
      username: testSlug,
      bio: 'Testing expanded endpoints: reels, AI helpers, blacklist, and account deactivation.',
      city: 'Pune',
      profileType: 'Creator',
      theme: 'default',
    });
    assert(setupRes.status === 200, 'Creator profile initialized for Tier 7 testing');

    // 1. Reserved Username Blacklist: check-username
    const reservedCheckAdmin = await client.get('/api/v1/profiles/check-username/admin');
    assert(
      reservedCheckAdmin.status === 200 && reservedCheckAdmin.data.data.available === false,
      'Check username for reserved word "admin" returns available: false'
    );

    const reservedCheckDashboard = await client.get('/api/v1/profiles/check-username/dashboard');
    assert(
      reservedCheckDashboard.status === 200 && reservedCheckDashboard.data.data.available === false,
      'Check username for reserved word "dashboard" returns available: false'
    );

    const reservedCheckApi = await client.get('/api/v1/profiles/check-username/api');
    assert(
      reservedCheckApi.status === 200 && reservedCheckApi.data.data.available === false,
      'Check username for reserved word "api" returns available: false'
    );

    // Format validation: too short (<3 chars) and invalid characters
    const shortCheck = await client.get('/api/v1/profiles/check-username/ab');
    assert(
      shortCheck.status === 200 && shortCheck.data.data.available === false && shortCheck.data.data.reason === 'invalid_format',
      'Check username for too short handle returns available: false with reason: "invalid_format"'
    );

    const invalidCharCheck = await client.get('/api/v1/profiles/check-username/bad_name!');
    assert(
      invalidCharCheck.status === 200 && invalidCharCheck.data.data.available === false && invalidCharCheck.data.data.reason === 'invalid_format',
      'Check username with invalid characters returns available: false with reason: "invalid_format"'
    );

    // 2. Reserved Username Blacklist: claim attempt in update profile
    const claimReservedRes = await client.put('/api/v1/profiles/me', {
      username: 'admin',
    });
    assert(
      claimReservedRes.status === 400 && claimReservedRes.data.success === false,
      'Attempting to claim reserved username "admin" in update profile rejected with 400'
    );

    // 3. Post a Reel
    const createReelRes = await client.post('/api/v1/reels', {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: 'Testing granular reel visibility & my-reels feed',
      durationSeconds: 20,
      visibility: 'public',
    });
    assert(createReelRes.status === 201 && createReelRes.data.success === true, 'Post reel returns 201 Created');
    const createdReelId = createReelRes.data.data._id;

    // 4. GET /api/v1/reels/my-reels
    const myReelsRes = await client.get('/api/v1/reels/my-reels');
    assert(myReelsRes.status === 200 && myReelsRes.data.success === true, 'GET /api/v1/reels/my-reels returns 200 OK');
    assert(
      Array.isArray(myReelsRes.data.data.reels) && myReelsRes.data.data.total >= 1,
      'GET /api/v1/reels/my-reels lists creator reels with total count'
    );

    // Unauthenticated access to /my-reels
    const unauthClient = new TestClient('http://localhost:5000');
    const unauthMyReels = await unauthClient.get('/api/v1/reels/my-reels');
    assert(unauthMyReels.status === 401, 'Unauthenticated GET /api/v1/reels/my-reels rejected with 401');

    // 5. PUT /api/v1/reels/:id/visibility (profile-only)
    const visProfOnlyRes = await client.put(`/api/v1/reels/${createdReelId}/visibility`, {
      visibility: 'profile-only',
    });
    assert(
      visProfOnlyRes.status === 200 && visProfOnlyRes.data.data.visibility === 'profile-only',
      'Update reel visibility to "profile-only" returns 200'
    );

    // 6. PUT /api/v1/reels/:id/visibility (private)
    const visPrivateRes = await client.put(`/api/v1/reels/${createdReelId}/visibility`, {
      visibility: 'private',
    });
    assert(
      visPrivateRes.status === 200 && visPrivateRes.data.data.visibility === 'private',
      'Update reel visibility to "private" returns 200'
    );

    // 7. PUT /api/v1/reels/:id/visibility (public)
    const visPublicRes = await client.put(`/api/v1/reels/${createdReelId}/visibility`, {
      visibility: 'public',
    });
    assert(
      visPublicRes.status === 200 && visPublicRes.data.data.visibility === 'public',
      'Update reel visibility to "public" returns 200'
    );

    // 8. Visibility validation: Invalid enum rejected
    const invalidVisRes = await client.put(`/api/v1/reels/${createdReelId}/visibility`, {
      visibility: 'super-secret',
    });
    assert(invalidVisRes.status === 400, 'Invalid visibility enum rejected with 400 Bad Request');

    // 9. Visibility: Non-existent reel returns 404
    const nonExistentVisRes = await client.put('/api/v1/reels/507f1f77bcf86cd799439011/visibility', {
      visibility: 'private',
    });
    assert(nonExistentVisRes.status === 404, 'Visibility update on non-existent reel returns 404');

    // 9b. Multi-tenant visibility isolation: Secondary creator cannot modify primary creator's reel
    const client2 = new TestClient('http://localhost:5000');
    const user2Phone = '9777' + Math.floor(100000 + Math.random() * 900000);
    await client2.post('/api/v1/auth/request-otp', { mobile: user2Phone });
    const verify2 = await client2.post('/api/v1/auth/verify-otp', { mobile: user2Phone, otp: '123456' });
    client2.setToken(verify2.data.data.token);
    await client2.put('/api/v1/profiles/me', {
      name: 'Second Creator',
      username: 'sec_' + Date.now().toString(36),
    });

    const unauthorizedVisRes = await client2.put(`/api/v1/reels/${createdReelId}/visibility`, {
      visibility: 'private',
    });
    assert(
      unauthorizedVisRes.status === 403,
      'Secondary creator receives 403 Forbidden attempting to update another creator reel visibility'
    );

    // 10. AI Bio Helper: POST /api/v1/ai/generate-bio
    const aiBioRes = await client.post('/api/v1/ai/generate-bio', {
      profession: 'Software Engineer',
      tone: 'punchy',
      keywords: ['Node.js', 'React', 'MongoDB'],
    });
    assert(aiBioRes.status === 200 && aiBioRes.data.success === true, 'POST /api/v1/ai/generate-bio returns 200 OK');
    assert(
      Array.isArray(aiBioRes.data.data.suggestions) && aiBioRes.data.data.suggestions.length >= 3,
      'AI Bio generator returns 3+ tailored bio suggestions'
    );
    assert(aiBioRes.data.data.tone === 'punchy', 'AI Bio reflects requested tone parameter');

    // 11. AI Caption Helper: POST /api/v1/ai/generate-caption
    const aiCaptionRes = await client.post('/api/v1/ai/generate-caption', {
      topic: 'Building a modern reels app',
      tone: 'engaging',
    });
    assert(
      aiCaptionRes.status === 200 && aiCaptionRes.data.success === true,
      'POST /api/v1/ai/generate-caption returns 200 OK'
    );
    assert(
      Array.isArray(aiCaptionRes.data.data.suggestions) && aiCaptionRes.data.data.suggestions.length >= 3,
      'AI Caption generator returns 3+ tailored caption suggestions'
    );
    assert(
      aiCaptionRes.data.data.suggestions[0].includes('#'),
      'AI Caption suggestions include relevant hashtags'
    );

    // 12. Account Deactivation / Deletion: DELETE /api/v1/profiles/me/account
    // First, publish profile so we can test it gets removed
    await client.post('/api/v1/profiles/me/publish');

    const deleteAccountRes = await client.delete('/api/v1/profiles/me/account');
    assert(
      deleteAccountRes.status === 200 && deleteAccountRes.data.success === true,
      'DELETE /api/v1/profiles/me/account returns 200 OK'
    );

    // Verify public profile is now removed (returns 404)
    const publicProfileAfterDelete = await client.get(`/api/v1/profiles/${testSlug}`);
    assert(
      publicProfileAfterDelete.status === 404,
      'Public profile is inaccessible (404 Not Found) after account deactivation'
    );

    // Verify creator reels are removed by cascading cleanup (returns 404)
    const reelAfterDelete = await client.get(`/api/v1/reels/${createdReelId}`);
    assert(
      reelAfterDelete.status === 404,
      'Creator reels removed by cascading cleanup (404 Not Found) after account deactivation'
    );

    // Verify unauthenticated DELETE /api/v1/profiles/me/account rejected
    const unauthDelete = await unauthClient.delete('/api/v1/profiles/me/account');
    assert(unauthDelete.status === 401, 'Unauthenticated DELETE /me/account rejected with 401');

  } catch (err) {
    console.error('Unhandled exception in Tier 7 tests:', err);
    failed++;
  }

  console.log(`\nTier 7 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier7Tests;

if (require.main === module) {
  runTier7Tests().then((res) => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
