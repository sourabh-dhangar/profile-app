const TestClient = require('./test-client');

async function runTier5Tests() {
  console.log('\n=== RUNNING TIER 5: ADVANCED ENHANCEMENT TESTS (vCard, Themes, Analytics) ===\n');
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
    // Setup: Create test user with phone
    const testPhone = '9555' + Math.floor(100000 + Math.random() * 900000);
    const otpRes = await client.post('/api/v1/auth/request-otp', { mobile: testPhone });
    const verifyRes = await client.post('/api/v1/auth/verify-otp', { mobile: testPhone, otp: '123456' });
    const token = verifyRes.data.data.token;
    client.setToken(token);

    const testSlug = 'enhancer_' + Date.now().toString(36);

    // 1. Initial Profile Setup
    const setupRes = await client.put('/api/v1/profiles/me', {
      name: 'Enhancement Hero',
      username: testSlug,
      bio: 'Testing vCard, visual themes, and privacy analytics.',
      city: 'Bangalore',
      profileType: 'Professional',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      contactDetails: {
        email: 'hero@example.com',
        phone: '+919999888877',
        showEmail: true,
        showPhone: false, // Start with hidden phone
      },
      theme: 'default',
    });
    assert(setupRes.status === 200 && setupRes.data.data.username === testSlug, 'Setup test profile for enhancements');

    // Publish profile so public endpoints (vCard, view, click, public profile) are enabled
    const pubRes = await client.post('/api/v1/profiles/me/publish');
    assert(pubRes.status === 200 && pubRes.data.data.status === 'published', 'Publish test profile to enable public accessibility');

    // 2. vCard Endpoint - Standard generation & Header Validation
    const vcardRes = await client.get(`/api/v1/profiles/${testSlug}/vcard`);
    assert(vcardRes.status === 200, 'GET /:username/vcard returns HTTP 200 OK');
    const contentType = vcardRes.headers['content-type'] || '';
    assert(contentType.includes('text/vcard'), 'vCard Content-Type header specifies text/vcard');
    const contentDisp = vcardRes.headers['content-disposition'] || '';
    assert(contentDisp.includes(`${testSlug}.vcf`), 'vCard Content-Disposition specifies .vcf filename attachment');

    // 3. RFC Compliance & Format verification
    const vcardBody = typeof vcardRes.data === 'string' ? vcardRes.data : '';
    assert(vcardBody.startsWith('BEGIN:VCARD\r\nVERSION:3.0'), 'vCard begins with RFC 6350 / vCard 3.0 header');
    assert(vcardBody.includes('FN:Enhancement Hero'), 'vCard includes FN (Full Name) parameter');
    assert(vcardBody.includes('EMAIL;TYPE=INTERNET:hero@example.com'), 'vCard includes public email address');
    assert(vcardBody.includes('END:VCARD\r\n'), 'vCard terminates with END:VCARD CRLF');

    // 4. Privacy Enforcement: Hidden phone is omitted from vCard
    assert(!vcardBody.includes('TEL;'), 'vCard strictly OMITS phone number when showPhone is false');

    // 5. Privacy Enforcement: Reveal phone when showPhone is explicitly true
    await client.put('/api/v1/profiles/me', {
      contactDetails: {
        email: 'hero@example.com',
        phone: '+919999888877',
        showEmail: true,
        showPhone: true,
      },
    });
    const vcardWithPhoneRes = await client.get(`/api/v1/profiles/${testSlug}/vcard`);
    const vcardWithPhoneBody = typeof vcardWithPhoneRes.data === 'string' ? vcardWithPhoneRes.data : '';
    assert(vcardWithPhoneBody.includes('TEL;') && vcardWithPhoneBody.includes('+919999888877'), 'vCard includes phone number when showPhone is true');

    // 6. Visual Theme Persistence: Update to cyberpunk-emerald
    const themeUpdateRes = await client.put('/api/v1/profiles/me', {
      theme: 'cyberpunk-emerald',
    });
    assert(themeUpdateRes.status === 200 && themeUpdateRes.data.data.theme === 'cyberpunk-emerald', 'Update profile theme to cyberpunk-emerald');

    // 7. Verify Theme reflected in Public Profile response
    const publicProfileRes = await client.get(`/api/v1/profiles/${testSlug}`);
    assert(publicProfileRes.status === 200 && publicProfileRes.data.data.profile.theme === 'cyberpunk-emerald', 'Public profile payload includes configured theme');

    // 8. Verify all 5 curated themes are supported
    const themes = ['default', 'dark-neon', 'minimalist-luxe', 'cyberpunk-emerald', 'sunset-gradient'];
    let allThemesValid = true;
    for (const th of themes) {
      const res = await client.put('/api/v1/profiles/me', { theme: th });
      if (res.status !== 200 || res.data.data.theme !== th) {
        allThemesValid = false;
        break;
      }
    }
    assert(allThemesValid, 'All 5 curated themes (default, dark-neon, minimalist-luxe, cyberpunk-emerald, sunset-gradient) accepted');

    // 9. Theme validation: Invalid theme rejected
    const invalidThemeRes = await client.put('/api/v1/profiles/me', { theme: 'invalid-retro-theme' });
    assert(invalidThemeRes.status === 400, 'Invalid theme rejection returns HTTP 400 Bad Request');

    // 10. Visitor Analytics: Track profile views
    const view1 = await client.post(`/api/v1/profiles/${testSlug}/view`);
    assert(view1.status === 200 && view1.data.data.totalViews >= 1, 'POST /:username/view tracks first profile view');
    const view2 = await client.post(`/api/v1/profiles/${testSlug}/view`);
    assert(view2.status === 200 && view2.data.data.totalViews === view1.data.data.totalViews + 1, 'POST /:username/view increments totalViews counter');

    // 11. Visitor Analytics: Track link clicks
    const click1 = await client.post(`/api/v1/profiles/${testSlug}/click`, {
      label: 'Portfolio Website',
      url: 'https://example.com/portfolio',
    });
    assert(click1.status === 200 && click1.data.data.totalClicks >= 1, 'POST /:username/click tracks link click event');

    const click2 = await client.post(`/api/v1/profiles/${testSlug}/click`, {
      label: 'Portfolio Website',
      url: 'https://example.com/portfolio',
    });
    assert(click2.status === 200 && click2.data.data.totalClicks === click1.data.data.totalClicks + 1, 'POST /:username/click increments totalClicks counter');

    // 12. Visitor Analytics: Owner Analytics Dashboard Endpoint & Precedence
    const analyticsRes = await client.get('/api/v1/profiles/me/analytics');
    assert(analyticsRes.status === 200, 'GET /api/v1/profiles/me/analytics returns HTTP 200');
    assert(analyticsRes.data.data.totalViews >= 2, 'Analytics returns accurate totalViews aggregation');
    assert(analyticsRes.data.data.totalClicks >= 2, 'Analytics returns accurate totalClicks aggregation');
    assert(Array.isArray(analyticsRes.data.data.dailyViews) && analyticsRes.data.data.dailyViews.length === 7, 'Analytics provides 7-day dailyViews trend window');
    assert(analyticsRes.data.data.dailyViews[6].count >= 2, 'Today views in dailyViews reflects tracked views');

    const portfolioLinkStat = analyticsRes.data.data.linkClicks.find(l => l.label === 'Portfolio Website');
    assert(portfolioLinkStat && portfolioLinkStat.count >= 2, 'Analytics itemizes link clicks per label');

    // 13. Route Precedence & Error Boundaries
    const nonExistentVcard = await client.get('/api/v1/profiles/non_existent_user_99999/vcard');
    assert(nonExistentVcard.status === 404, 'vCard for non-existent profile returns HTTP 404 Not Found');

    const nonExistentView = await client.post('/api/v1/profiles/non_existent_user_99999/view');
    assert(nonExistentView.status === 404, 'View ping for non-existent profile returns HTTP 404 Not Found');

    // Unauthorized analytics access
    const unauthClient = new TestClient('http://localhost:5000');
    const unauthAnalytics = await unauthClient.get('/api/v1/profiles/me/analytics');
    assert(unauthAnalytics.status === 401, 'Unauthenticated access to /me/analytics strictly rejected with 401');

  } catch (err) {
    console.error('Unhandled exception in Tier 5 tests:', err);
    failed++;
  }

  console.log(`\nTier 5 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier5Tests;

if (require.main === module) {
  runTier5Tests().then(res => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
