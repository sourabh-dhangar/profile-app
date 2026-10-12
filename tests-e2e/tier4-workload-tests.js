const TestClient = require('./test-client');

async function runTier4Tests() {
  console.log('\n=== RUNNING TIER 4: REAL-WORLD APPLICATION WORKLOAD SCENARIOS ===\n');
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
    // SCENARIO 1: Rich Portfolio Creation & Completion Scoring
    // -------------------------------------------------------------
    console.log('\n--- Scenario 1: Rich Portfolio Creation & Completion Scoring ---');
    const user1Phone = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const c1 = new TestClient('http://localhost:5000');
    await c1.post('/api/v1/auth/request-otp', { mobile: user1Phone });
    const auth1 = await c1.post('/api/v1/auth/verify-otp', { mobile: user1Phone, otp: '123456' });
    c1.setToken(auth1.data.data.token);

    const slug1 = 'pro_creator_' + Date.now().toString(36);
    const updateRes = await c1.put('/api/v1/profiles/me', {
      name: 'Dr. Jane Smith',
      username: slug1,
      bio: 'Biochemist and Data Visualizer with 10+ years experience in proteomics and AI.',
      headline: 'Principal Scientist & Tech Consultant',
      city: 'Bangalore',
      profileType: 'Professional',
      socialLinks: [
        { platform: 'github', url: 'https://github.com/janesmith' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/janesmith' },
      ],
      contactDetails: { email: 'jane@example.com', showEmail: true },
    });
    assert(updateRes.status === 200, 'Scenario 1: Profile metadata updated');

    // Add 4 diverse sections
    await c1.post('/api/v1/profiles/me/sections', {
      type: 'skills',
      title: 'Technical Competencies',
      content: { items: ['Python', 'Biopython', 'React', 'MongoDB'] },
    });
    await c1.post('/api/v1/profiles/me/sections', {
      type: 'experience',
      title: 'Career History',
      content: { items: ['Senior Researcher at GeneCorp (2020-Present)', 'Postdoc Fellow at AIIMS (2017-2020)'] },
    });
    await c1.post('/api/v1/profiles/me/sections', {
      type: 'projects',
      title: 'Flagship Projects',
      content: { items: ['Genomic Atlas Visualizer', 'Bioinformatics Pipeline CLI'] },
    });
    await c1.post('/api/v1/profiles/me/sections', {
      type: 'links',
      title: 'Featured Publications',
      content: { items: ['Nature Biotechnology Paper 2024', 'BioRxiv Preprint 2025'] },
    });

    const pub1 = await c1.post('/api/v1/profiles/me/publish');
    assert(pub1.status === 200 && pub1.data.data.completionPercentage >= 70, 'Scenario 1: High completion score achieved for rich profile');

    // -------------------------------------------------------------
    // SCENARIO 2: Video Creator Batch Upload & Engagement Velocity
    // -------------------------------------------------------------
    console.log('\n--- Scenario 2: Video Creator Batch Upload & High Engagement ---');
    const reel1 = await c1.post('/api/v1/reels', {
      videoUrl: 'https://assets.example.com/videos/demo1.mp4',
      caption: 'A quick tour of my laboratory setup #science #tech',
      durationSeconds: 25,
    });
    const reel2 = await c1.post('/api/v1/reels', {
      videoUrl: 'https://assets.example.com/videos/demo2.mp4',
      caption: 'Top 3 tools every developer should learn #coding #tips',
      durationSeconds: 40,
    });
    assert(reel1.status === 201 && reel2.status === 201, 'Scenario 2: Creator posts multiple reels');

    // Simulating public viewers engaging with the reels
    const publicViewer = new TestClient('http://localhost:5000');
    await publicViewer.post(`/api/v1/reels/${reel1.data.data._id}/view`);
    await publicViewer.post(`/api/v1/reels/${reel1.data.data._id}/view`);
    // Authenticated user likes reel
    const likeRes = await c1.post(`/api/v1/reels/${reel1.data.data._id}/like`);
    assert(likeRes.status === 200 && likeRes.data.data.likesCount >= 1, 'Scenario 2: Reel receives and tallies likes & views');

    // -------------------------------------------------------------
    // SCENARIO 3: Phone Discovery Lifecycle & Absolute Anti-Enumeration
    // -------------------------------------------------------------
    console.log('\n--- Scenario 3: Phone Discovery Opt-in/Opt-out Privacy ---');
    const discPhone = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const c3 = new TestClient('http://localhost:5000');
    await c3.post('/api/v1/auth/request-otp', { mobile: discPhone });
    const auth3 = await c3.post('/api/v1/auth/verify-otp', { mobile: discPhone, otp: '123456' });
    c3.setToken(auth3.data.data.token);

    const slug3 = 'private_user_' + Date.now().toString(36);
    await c3.put('/api/v1/profiles/me', {
      name: 'Private User',
      username: slug3,
      bio: 'Enthusiastic developer and privacy advocate with full portfolio.',
      city: 'Mumbai',
    });
    await c3.post('/api/v1/profiles/me/publish');

    // Initially allowDiscovery is false -> lookup returns 404
    const searchBefore = await publicViewer.post('/api/v1/discovery/search-by-phone', { phone: discPhone });
    assert(searchBefore.status === 404, 'Scenario 3: Before opt-in, phone lookup returns 404 anti-enumeration');

    // Opt-in to discovery
    await c3.put('/api/v1/discovery/settings', { allowDiscovery: true });
    const searchAfter = await publicViewer.post('/api/v1/discovery/search-by-phone', { phone: discPhone });
    assert(searchAfter.status === 200 && searchAfter.data.data.username === slug3, 'Scenario 3: After opt-in, phone lookup locates correct profile');

    // Opt-out again
    await c3.put('/api/v1/discovery/settings', { allowDiscovery: false });
    const searchFinal = await publicViewer.post('/api/v1/discovery/search-by-phone', { phone: discPhone });
    assert(searchFinal.status === 404, 'Scenario 3: After opt-out, phone lookup reverts to 404 privacy mask');

    // -------------------------------------------------------------
    // SCENARIO 4: Moderation Escalation & Content Removal
    // -------------------------------------------------------------
    console.log('\n--- Scenario 4: Moderation Escalation & Content Removal ---');
    // Viewer flags reel2 for violation
    const repRes = await publicViewer.post('/api/v1/reports', {
      targetType: 'reel',
      targetId: reel2.data.data._id,
      reason: 'Misleading content',
    });
    assert(repRes.status === 201, 'Scenario 4: Community report filed');

    // Admin verifies report in queue and removes content
    const adminClient = new TestClient('http://localhost:5000');
    await adminClient.post('/api/v1/auth/request-otp', { mobile: '9999999999' });
    const adminAuth = await adminClient.post('/api/v1/auth/verify-otp', { mobile: '9999999999', otp: '123456' });
    adminClient.setToken(adminAuth.data.data.token);

    const reportList = await adminClient.get('/api/v1/admin/reports?status=pending');
    assert(reportList.status === 200 && reportList.data.data.reports.length > 0, 'Scenario 4: Admin views active report queue');

    const modAction = await adminClient.put(`/api/v1/admin/reports/${repRes.data.data._id}`, {
      status: 'resolved',
      actionTaken: 'takedown',
      adminNotes: 'Content violated platform standards.',
    });
    assert(modAction.status === 200 && modAction.data.data.status === 'resolved', 'Scenario 4: Report resolved with takedown');

    // -------------------------------------------------------------
    // SCENARIO 5: Admin Platform Metrics & User Oversight
    // -------------------------------------------------------------
    console.log('\n--- Scenario 5: Admin Platform Metrics & Oversight ---');
    const analyticsRes = await adminClient.get('/api/v1/admin/analytics');
    assert(analyticsRes.status === 200 && analyticsRes.data.data.users.total >= 2, 'Scenario 5: Admin retrieves live platform metrics');

    const usersList = await adminClient.get('/api/v1/admin/users?limit=10');
    assert(usersList.status === 200 && usersList.data.data.users.length >= 2, 'Scenario 5: Admin lists registered platform users');

  } catch (err) {
    console.error('Tier 4 unexpected error:', err);
    failed++;
  }

  console.log(`\nTier 4 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier4Tests;

if (require.main === module) {
  runTier4Tests();
}
