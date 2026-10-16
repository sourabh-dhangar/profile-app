const TestClient = require('./test-client');

async function runTier8Tests() {
  console.log('\n=== RUNNING TIER 8: CREATOR EXPANSION & MASTER PITCH TESTS ===\n');
  const creatorClient = new TestClient('http://localhost:5000');
  const peerClient = new TestClient('http://localhost:5000');
  const visitorClient = new TestClient('http://localhost:5000');
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
    const timestamp = Date.now().toString(36);

    // 1. Setup Creator User
    const creatorPhone = '9881' + Math.floor(100000 + Math.random() * 900000);
    await creatorClient.post('/api/v1/auth/request-otp', { mobile: creatorPhone });
    const verifyCreator = await creatorClient.post('/api/v1/auth/verify-otp', { mobile: creatorPhone, otp: '123456' });
    const creatorToken = verifyCreator.data.data.token;
    creatorClient.setToken(creatorToken);

    const creatorSlug = 'creator_t8_' + timestamp;
    await creatorClient.put('/api/v1/profiles/me', {
      name: 'Elena Rostova',
      username: creatorSlug,
      bio: 'Fullstack Architect & Creative Technologist.',
      city: 'Bengaluru, India',
      profileType: 'Creator',
      verifiedBadge: 'verified_pro',
      isVerifiedBadge: true,
      skills: [
        { name: 'React Native', vouches: 0 },
        { name: 'TypeScript', vouches: 0 },
      ],
      contactDetails: {
        email: 'elena@example.com',
        phone: '+919881000001',
        showEmail: true,
        showPhone: true,
      },
    });
    await creatorClient.post('/api/v1/profiles/me/publish');
    assert(true, 'Creator account onboarded with skills and published');

    // 2. Setup Peer User
    const peerPhone = '9882' + Math.floor(100000 + Math.random() * 900000);
    await peerClient.post('/api/v1/auth/request-otp', { mobile: peerPhone });
    const verifyPeer = await peerClient.post('/api/v1/auth/verify-otp', { mobile: peerPhone, otp: '123456' });
    const peerToken = verifyPeer.data.data.token;
    peerClient.setToken(peerToken);

    const peerSlug = 'peer_t8_' + timestamp;
    await peerClient.put('/api/v1/profiles/me', {
      name: 'Marcus Vance',
      username: peerSlug,
      bio: 'Staff Engineer & Reviewer.',
      city: 'Pune, India',
      profileType: 'Professional',
    });
    assert(true, 'Peer account onboarded successfully');

    // --- SUB-SUITE A: PINNED MASTER PITCH REEL ---
    console.log('\n--- Sub-Suite A: Pinned Master Pitch Reel ---');
    
    // Create Reel 1
    const reel1Res = await creatorClient.post('/api/v1/reels', {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      caption: 'Offline-first SQLite sync engine #reactnative #offline',
      durationSeconds: 28,
      audioTrack: { title: 'Neon Highway', artist: 'SynthPulse' },
    });
    assert(reel1Res.status === 201 && reel1Res.data.success, 'Creator creates Reel 1 with audio track metadata');
    const reel1Id = reel1Res.data.data._id;
    assert(reel1Res.data.data.audioTrack?.title === 'Neon Highway', 'Reel 1 correctly stores audio track title');

    // Create Reel 2
    const reel2Res = await creatorClient.post('/api/v1/reels', {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      caption: 'Three.js 3D Interactive Portfolio in React #threejs #webgl',
      durationSeconds: 32,
    });
    assert(reel2Res.status === 201 && reel2Res.data.success, 'Creator creates Reel 2');
    const reel2Id = reel2Res.data.data._id;

    // Pin Reel 2 as Master Pitch
    const pinRes = await creatorClient.post(`/api/v1/reels/${reel2Id}/pin`);
    assert(pinRes.status === 200 && pinRes.data.data.isPinned === true, 'Creator pins Reel 2 as Master Pitch');

    // Verify Peer cannot pin someone else's reel
    const peerPinRes = await peerClient.post(`/api/v1/reels/${reel2Id}/pin`);
    assert(peerPinRes.status === 403, 'Unauthorized user is rejected when attempting to pin reel (403)');

    // Pin Reel 1 -> Reel 2 should automatically be unpinned (single master pitch guarantee)
    const pinReel1Res = await creatorClient.post(`/api/v1/reels/${reel1Id}/pin`);
    assert(pinReel1Res.status === 200 && pinReel1Res.data.data.isPinned === true, 'Creator pins Reel 1 as new Master Pitch');

    const checkReel2 = await visitorClient.get(`/api/v1/reels/${reel2Id}`);
    assert(checkReel2.data.data.isPinned === false, 'Previous pinned Reel 2 is automatically unpinned');

    // Unpin Reel 1 cleanly
    const unpinReel1Res = await creatorClient.post(`/api/v1/reels/${reel1Id}/pin`);
    assert(unpinReel1Res.status === 200 && unpinReel1Res.data.data.isPinned === false, 'Creator toggles unpin on Reel 1');

    // --- SUB-SUITE B: SKILL VOUCHING & ENDORSEMENTS ---
    console.log('\n--- Sub-Suite B: Skill Vouching & Endorsements ---');

    // Peer vouches for Creator's 'React Native' skill
    const vouchRes1 = await peerClient.post(`/api/v1/profiles/${creatorSlug}/skills/vouch`, {
      skill: 'React Native',
    });
    assert(vouchRes1.status === 200 && vouchRes1.data.data.vouches >= 1, 'Peer vouches for React Native skill (+1 vouch)');

    // Peer vouches a second time for 'React Native'
    const vouchRes2 = await peerClient.post(`/api/v1/profiles/${creatorSlug}/skills/vouch`, {
      skill: 'React Native',
    });
    assert(vouchRes2.status === 200 && vouchRes2.data.data.vouches === vouchRes1.data.data.vouches + 1, 'Subsequent vouch correctly increments tally');

    // Verify public profile returns updated skill vouches in skills section
    const pubProfileRes = await visitorClient.get(`/api/v1/profiles/${creatorSlug}`);
    const skillsSec = pubProfileRes.data.data?.sections?.find(s => s.type === 'skills');
    const rnSkill = skillsSec?.content?.items?.find(s => s.name === 'React Native');
    assert(rnSkill && rnSkill.vouches >= 2, 'Public profile payload includes updated vouch tally for skill');

    // Vouch for an empty skill name rejected
    const badVouchRes = await peerClient.post(`/api/v1/profiles/${creatorSlug}/skills/vouch`, {
      skill: '   ',
    });
    assert(badVouchRes.status === 400, 'Empty skill name rejected with 400 Bad Request');

    // --- SUB-SUITE C: NOTIFICATIONS HUB ---
    console.log('\n--- Sub-Suite C: Notifications Hub ---');

    // Creator retrieves their notifications
    const notifsRes = await creatorClient.get('/api/v1/notifications');
    assert(notifsRes.status === 200 && Array.isArray(notifsRes.data.data.notifications), 'Creator fetches notifications list (200 OK)');
    assert(notifsRes.data.data.unreadCount >= 1, 'Notifications hub reports positive unreadCount');

    const firstNotifId = notifsRes.data.data.notifications[0]._id;

    // Mark single notification as read
    const markSingleRes = await creatorClient.patch(`/api/v1/notifications/${firstNotifId}/read`);
    assert(markSingleRes.status === 200 && markSingleRes.data.data.notification.read === true, 'Mark single notification as read updates status');

    // Mark all notifications as read
    const markAllRes = await creatorClient.post('/api/v1/notifications/read-all');
    assert(markAllRes.status === 200 && markAllRes.data.data.unreadCount === 0, 'Mark all notifications as read resets unreadCount to 0');

    // Verify unauthenticated access rejected
    const unauthNotifsRes = await visitorClient.get('/api/v1/notifications');
    assert(unauthNotifsRes.status === 401, 'Unauthenticated access to notifications rejected with 401');

    // --- SUB-SUITE D: 2-WAY INQUIRY REPLIES ---
    console.log('\n--- Sub-Suite D: 2-Way Inquiry Replies ---');

    // Visitor submits client proposal inquiry
    const inqSubmission = await visitorClient.post(`/api/v1/profiles/${creatorSlug}/inquiries`, {
      senderName: 'Apex Capital Partners',
      senderEmail: 'partners@apexcap.com',
      subject: 'Lead Mobile Architect Engagement',
      message: 'We are expanding our fintech product and want to retain your architectural services.',
    });
    assert(inqSubmission.status === 201 && inqSubmission.data.success, 'Client submits inquiry proposal (201 Created)');
    const inquiryId = inqSubmission.data.data._id;

    // Creator sends structured in-app reply
    const replyRes = await creatorClient.post(`/api/v1/profiles/me/inquiries/${inquiryId}/reply`, {
      message: 'Thank you for reaching out! I would love to discuss the project scope on Tuesday.',
    });
    assert(replyRes.status === 200 && replyRes.data.success, 'Creator posts 2-way reply to client inquiry (200 OK)');
    assert(replyRes.data.data.status === 'replied', 'Inquiry status transitions to replied');
    assert(Array.isArray(replyRes.data.data.replies) && replyRes.data.data.replies.length === 1, 'Inquiry stores reply array');
    assert(replyRes.data.data.replies[0].senderRole === 'creator', 'Reply accurately records creator senderRole');

    // Reject empty reply message
    const emptyReplyRes = await creatorClient.post(`/api/v1/profiles/me/inquiries/${inquiryId}/reply`, {
      message: '   ',
    });
    assert(emptyReplyRes.status === 400, 'Empty reply message rejected with 400 Bad Request');

    // Peer attempts to reply to someone else's inquiry -> 404 or 403
    const unauthorizedReplyRes = await peerClient.post(`/api/v1/profiles/me/inquiries/${inquiryId}/reply`, {
      message: 'Intruding on inquiry',
    });
    assert(unauthorizedReplyRes.status === 404, 'Unauthorized creator cannot access or reply to another creator inquiry (404)');

  } catch (err) {
    console.error('Unhandled exception in Tier 8 tests:', err);
    failed++;
  }

  console.log(`\nTier 8 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier8Tests;

if (require.main === module) {
  runTier8Tests().then(res => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
