const TestClient = require('./test-client');

async function runTier2Tests() {
  console.log('\n=== RUNNING TIER 2: BOUNDARY & CORNER CASE TESTS ===\n');
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
    // 1. Boundary: Empty mobile in request-otp
    const emptyMobileRes = await client.post('/api/v1/auth/request-otp', { mobile: '' });
    assert(emptyMobileRes.status === 400, 'Empty mobile in request-otp returns 400 Bad Request');

    // 2. Boundary: Invalid OTP in verify-otp
    const badOtpRes = await client.post('/api/v1/auth/verify-otp', { mobile: '9876543210', otp: '000000' });
    assert(badOtpRes.status === 400, 'Invalid OTP code in verify-otp returns 400 Bad Request');

    // Authenticate a standard user for protected boundary tests
    await client.post('/api/v1/auth/request-otp', { mobile: '9876543210' });
    const authRes = await client.post('/api/v1/auth/verify-otp', { mobile: '9876543210', otp: '123456' });
    client.setToken(authRes.data.data.token);

    // 3. Boundary: Reel duration > 60 seconds rejected
    const invalidReelRes = await client.post('/api/v1/reels', {
      videoUrl: 'https://example.com/video.mp4',
      durationSeconds: 75, // exceeds 60s limit
    });
    assert(invalidReelRes.status === 400, 'Reel duration exceeding 60s is rejected with 400 Bad Request');

    // 4. Boundary: Duplicate username collision
    const takenUsername = 'rahul_dev'; // already owned by creator 1
    // create a 2nd user
    const client2 = new TestClient('http://localhost:5000');
    await client2.post('/api/v1/auth/request-otp', { mobile: '9811122233' });
    const auth2 = await client2.post('/api/v1/auth/verify-otp', { mobile: '9811122233', otp: '123456' });
    client2.setToken(auth2.data.data.token);

    const dupUsernameRes = await client2.put('/api/v1/profiles/me', {
      username: takenUsername,
    });
    assert(dupUsernameRes.status === 409, 'Duplicate username slug is rejected with 409 Conflict');

    // 5. Boundary: Non-existent public profile returns 404
    const notFoundProfileRes = await client.get('/api/v1/profiles/non_existent_slug_9999');
    assert(notFoundProfileRes.status === 404, 'Non-existent public profile returns 404 Not Found');

    // 6. Boundary: Phone discovery for non-discoverable user returns 404 (Privacy guarantee)
    // First disable discovery on user 2
    await client2.put('/api/v1/discovery/settings', { allowDiscovery: false });
    const privacyCheckRes = await client.post('/api/v1/discovery/search-by-phone', {
      phone: '9811122233',
    });
    assert(privacyCheckRes.status === 404, 'Searching phone of user with allowDiscovery=false returns 404 Not Found');

    // 7. Boundary: Normal user accessing Admin reports endpoint rejected with 403
    const forbiddenAdminRes = await client.get('/api/v1/admin/reports');
    assert(forbiddenAdminRes.status === 403, 'Standard user accessing admin reports is rejected with 403 Forbidden');

    // 8. Boundary: Malformed or unauthenticated request to protected endpoint
    const unauthClient = new TestClient('http://localhost:5000');
    const unauthRes = await unauthClient.get('/api/v1/profiles/me');
    assert(unauthRes.status === 401, 'Unauthenticated request to /profiles/me returns 401 Unauthorized');

  } catch (err) {
    console.error('Tier 2 unexpected error:', err);
    failed++;
  }

  console.log(`\nTier 2 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier2Tests;

if (require.main === module) {
  runTier2Tests();
}
