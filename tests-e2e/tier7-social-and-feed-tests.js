const TestClient = require('./test-client');

async function runTier7Tests() {
  console.log('\n=== RUNNING TIER 7: REELS SOCIAL, COMMENTS & FOLLOW NETWORK TESTS ===\n');
  const clientA = new TestClient('http://localhost:5000');
  const clientB = new TestClient('http://localhost:5000');
  const clientC = new TestClient('http://localhost:5000');
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

    // 1. Setup User A (Creator)
    const phoneA = '9777' + Math.floor(100000 + Math.random() * 900000);
    await clientA.post('/api/v1/auth/request-otp', { mobile: phoneA });
    const verifyA = await clientA.post('/api/v1/auth/verify-otp', { mobile: phoneA, otp: '123456' });
    const tokenA = verifyA.data.data.token;
    clientA.setToken(tokenA);

    const slugA = 'creator_' + timestamp;
    await clientA.put('/api/v1/profiles/me', {
      name: 'Creator Alpha',
      username: slugA,
      bio: 'Producing tech reels & UI breakdowns.',
      city: 'Bengaluru',
      profileType: 'Creator',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    });
    await clientA.post('/api/v1/profiles/me/publish');

    // 2. Setup User B (Follower)
    const phoneB = '9778' + Math.floor(100000 + Math.random() * 900000);
    await clientB.post('/api/v1/auth/request-otp', { mobile: phoneB });
    const verifyB = await clientB.post('/api/v1/auth/verify-otp', { mobile: phoneB, otp: '123456' });
    const tokenB = verifyB.data.data.token;
    clientB.setToken(tokenB);

    const slugB = 'follower_' + timestamp;
    await clientB.put('/api/v1/profiles/me', {
      name: 'User Beta',
      username: slugB,
      bio: 'Enthusiastic viewer & developer.',
      city: 'Delhi',
      profileType: 'Engineer',
    });

    // 3. Setup User C (Third Party)
    const phoneC = '9779' + Math.floor(100000 + Math.random() * 900000);
    await clientC.post('/api/v1/auth/request-otp', { mobile: phoneC });
    const verifyC = await clientC.post('/api/v1/auth/verify-otp', { mobile: phoneC, otp: '123456' });
    const tokenC = verifyC.data.data.token;
    clientC.setToken(tokenC);

    const slugC = 'viewer_' + timestamp;
    await clientC.put('/api/v1/profiles/me', {
      name: 'Viewer Charlie',
      username: slugC,
      bio: 'Casual observer.',
    });

    assert(tokenA && tokenB && tokenC, 'Successfully initialized 3 isolated test users (Creator A, Follower B, Viewer C)');

    // 4. Creator A creates a Reel
    const createReelRes = await clientA.post('/api/v1/reels', {
      caption: 'Testing interactive 60fps social reels and comments! 🚀 #social',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      durationSeconds: 15,
      visibility: 'public',
    });

    assert(createReelRes.status === 201 && createReelRes.data.success, 'Creator A creates public reel (201 Created)');
    const reelId = createReelRes.data.data._id;
    assert(createReelRes.data.data.commentsCount === 0, 'New reel initializes with commentsCount: 0');

    // 4b. Cloudinary Config & Streaming Optimization Verification
    const cloudConfigRes = await clientA.get('/api/v1/reels/cloudinary-config');
    assert(cloudConfigRes.status === 200 && cloudConfigRes.data.data.cloudName, 'GET /reels/cloudinary-config returns 200 and valid cloudName');

    const createCloudReelRes = await clientA.post('/api/v1/reels', {
      caption: 'Cloudinary fast CDN reel #fast #cdn',
      videoUrl: 'https://res.cloudinary.com/gphexfmz/video/upload/v12345/reels/sample_clip.mp4',
      durationSeconds: 20,
      visibility: 'public',
    });
    assert(createCloudReelRes.status === 201 && createCloudReelRes.data.success, 'Creator A posts Cloudinary reel (201 Created)');
    assert(createCloudReelRes.data.data.videoUrl.includes('q_auto,f_auto'), 'Cloudinary videoUrl automatically optimized with q_auto,f_auto');
    assert(createCloudReelRes.data.data.thumbnailUrl.includes('so_0'), 'Cloudinary thumbnailUrl automatically generated with so_0 poster frame');

    // 5. Check Follow Status before following
    const checkBeforeRes = await clientB.get(`/api/v1/profiles/${slugA}/follow-status`);
    assert(checkBeforeRes.status === 200 && checkBeforeRes.data.data.isFollowing === false, 'Follow status before following is false');

    // 6. User B follows Creator A
    const followRes = await clientB.post(`/api/v1/profiles/${slugA}/follow`);
    assert(followRes.status === 200 && followRes.data.data.isFollowing === true, 'User B follows Creator A successfully (200 OK)');
    assert(followRes.data.data.followersCount === 1, 'Follow response returns updated followersCount: 1');

    // 7. Verify Follow Status after following
    const checkAfterRes = await clientB.get(`/api/v1/profiles/${slugA}/follow-status`);
    assert(checkAfterRes.status === 200 && checkAfterRes.data.data.isFollowing === true, 'Follow status after following is true');

    // 8. Self-Follow Prevention Guard
    const selfFollowRes = await clientA.post(`/api/v1/profiles/${slugA}/follow`);
    assert(selfFollowRes.status === 400 && selfFollowRes.data.success === false, 'Creator cannot follow themselves (400 Bad Request)');

    // 9. Verify Public Profile Metrics Reflect Follower Count
    const publicProfileRes = await clientC.get(`/api/v1/profiles/${slugA}`);
    assert(publicProfileRes.status === 200 && publicProfileRes.data.data.profile.followersCount === 1, 'Public profile reflects followersCount: 1');

    // 10. Following Feed: User B (who follows Creator A) sees reel
    const followingFeedB = await clientB.get('/api/v1/reels/feed/following');
    assert(followingFeedB.status === 200 && followingFeedB.data.success, 'User B accesses following feed (200 OK)');
    const foundInFollowing = followingFeedB.data.data.reels.some((r) => r._id === reelId);
    assert(foundInFollowing, 'User B following feed contains Creator A reel');

    // 11. Following Feed: User C (who does not follow Creator A) sees 0 reels
    const followingFeedC = await clientC.get('/api/v1/reels/feed/following');
    assert(followingFeedC.status === 200 && followingFeedC.data.data.reels.length === 0, 'User C following feed is empty (does not follow Creator A)');

    // 12. Comments: Unauthenticated post comment should fail
    const unauthClient = new TestClient('http://localhost:5000');
    const unauthCommentRes = await unauthClient.post(`/api/v1/reels/${reelId}/comments`, {
      text: 'Should fail without auth',
    });
    assert(unauthCommentRes.status === 401, 'Unauthenticated comment submission rejected (401 Unauthorized)');

    // 13. User B posts comment on Creator A reel
    const comment1Res = await clientB.post(`/api/v1/reels/${reelId}/comments`, {
      text: 'Super clean video demo! Loving the glassmorphic UI 🔥',
    });
    assert(comment1Res.status === 201 && comment1Res.data.success, 'User B posts comment on reel (201 Created)');
    assert(comment1Res.data.data.text.includes('glassmorphic'), 'Comment text matches payload');
    assert(comment1Res.data.data.profileId?.username === slugB, 'Comment contains User B author profile info');
    const comment1Id = comment1Res.data.data._id;

    // 14. User C posts a second comment
    const comment2Res = await clientC.post(`/api/v1/reels/${reelId}/comments`, {
      text: 'Great animation performance! ⚡',
    });
    assert(comment2Res.status === 201 && comment2Res.data.success, 'User C posts second comment on reel (201 Created)');
    const comment2Id = comment2Res.data.data._id;

    // 15. Fetch Comments
    const getCommentsRes = await clientA.get(`/api/v1/reels/${reelId}/comments`);
    assert(getCommentsRes.status === 200 && getCommentsRes.data.data.comments.length === 2, 'Reel comments list contains both comments');
    assert(getCommentsRes.data.data.commentsCount === 2, 'Comments count returned is 2');

    // 16. Comment Deletion Authorization: User C attempts to delete User B comment
    const unauthorizedDeleteRes = await clientC.delete(`/api/v1/reels/${reelId}/comments/${comment1Id}`);
    assert(unauthorizedDeleteRes.status === 403, 'Unauthorized comment deletion rejected (403 Forbidden)');

    // 17. Comment Deletion by Comment Author (User B deletes comment 1)
    const deleteOwnCommentRes = await clientB.delete(`/api/v1/reels/${reelId}/comments/${comment1Id}`);
    assert(deleteOwnCommentRes.status === 200 && deleteOwnCommentRes.data.success, 'Comment author (User B) deletes their comment (200 OK)');
    assert(deleteOwnCommentRes.data.data.commentsCount === 1, 'Reel commentsCount decrements to 1');

    // 18. Comment Deletion by Reel Creator (Creator A deletes comment 2)
    const creatorDeleteCommentRes = await clientA.delete(`/api/v1/reels/${reelId}/comments/${comment2Id}`);
    assert(creatorDeleteCommentRes.status === 200 && creatorDeleteCommentRes.data.success, 'Reel Creator (Creator A) moderates/deletes comment 2 (200 OK)');
    assert(creatorDeleteCommentRes.data.data.commentsCount === 0, 'Reel commentsCount decrements to 0');

    // 19. Unfollow: User B unfollows Creator A
    const unfollowRes = await clientB.post(`/api/v1/profiles/${slugA}/follow`);
    assert(unfollowRes.status === 200 && unfollowRes.data.data.isFollowing === false, 'User B unfollows Creator A (200 OK)');
    assert(unfollowRes.data.data.followersCount === 0, 'Followers count decrements to 0');

    // 20. Following Feed after unfollowing
    const feedAfterUnfollow = await clientB.get('/api/v1/reels/feed/following');
    assert(feedAfterUnfollow.data.data.reels.length === 0, 'Following feed is now empty after unfollowing');

  } catch (err) {
    console.error('Tier 7 Execution Exception:', err);
    failed++;
  }

  console.log(`\nTier 7 Results: ${passed} Passed, ${failed} Failed`);
  return { passed, failed };
}

if (require.main === module) {
  runTier7Tests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = runTier7Tests;
