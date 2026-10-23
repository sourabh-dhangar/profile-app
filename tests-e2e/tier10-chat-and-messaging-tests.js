const TestClient = require('./test-client');

async function runTier10Tests() {
  console.log('\n=== RUNNING TIER 10: DIRECT 1-ON-1 CHAT & MESSAGING TESTS ===\n');
  const userAClient = new TestClient('http://localhost:5000');
  const userBClient = new TestClient('http://localhost:5000');
  const unauthClient = new TestClient('http://localhost:5000');

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

    // 1. Setup User A (Alice)
    const phoneA = '9661' + Math.floor(100000 + Math.random() * 900000);
    await userAClient.post('/api/v1/auth/request-otp', { mobile: phoneA });
    const verifyA = await userAClient.post('/api/v1/auth/verify-otp', { mobile: phoneA, otp: '123456' });
    userAClient.setToken(verifyA.data.data.token);

    const userASlug = 'creator_a_' + timestamp;
    const updateResA = await userAClient.put('/api/v1/profiles/me', {
      name: 'Alice Cooper',
      username: userASlug,
      profileType: 'Professional',
      category: 'IT & Software',
      bio: 'Fullstack React and Node engineer building scalable real-time systems.',
    });
    assert(updateResA.status === 200, 'Alice profile updated successfully (200 OK)');
    await userAClient.post('/api/v1/profiles/me/publish', {});

    // 2. Setup User B (Bob)
    const phoneB = '9662' + Math.floor(100000 + Math.random() * 900000);
    await userBClient.post('/api/v1/auth/request-otp', { mobile: phoneB });
    const verifyB = await userBClient.post('/api/v1/auth/verify-otp', { mobile: phoneB, otp: '123456' });
    userBClient.setToken(verifyB.data.data.token);

    const userBSlug = 'creator_b_' + timestamp;
    const updateResB = await userBClient.put('/api/v1/profiles/me', {
      name: 'Bob Martin',
      username: userBSlug,
      profileType: 'Freelancer',
      category: 'Content Creator & Artist',
      bio: 'UI/UX Specialist and Motion Designer.',
    });
    assert(updateResB.status === 200, 'Bob profile updated successfully (200 OK)');
    await userBClient.post('/api/v1/profiles/me/publish', {});

    // 3. Security: Unauthenticated access rejected
    const unauthRes = await unauthClient.get('/api/v1/chat/conversations');
    assert(unauthRes.status === 401, 'Unauthenticated chat conversations request returns 401 Unauthorized');

    const unauthCountRes = await unauthClient.get('/api/v1/chat/unread-count');
    assert(unauthCountRes.status === 401, 'Unauthenticated unread-count request returns 401 Unauthorized');

    // 4. Initial state: Both have 0 unread messages
    const unreadA0 = await userAClient.get('/api/v1/chat/unread-count');
    assert(unreadA0.status === 200 && unreadA0.data.data?.unreadCount === 0, 'Alice has initial unread count of 0');

    const unreadB0 = await userBClient.get('/api/v1/chat/unread-count');
    assert(unreadB0.status === 200 && unreadB0.data.data?.unreadCount === 0, 'Bob has initial unread count of 0');

    // 5. Validation: Cannot send message to oneself
    const selfMsgRes = await userAClient.post(`/api/v1/chat/conversations/${userASlug}/messages`, {
      text: 'Talking to myself',
    });
    assert(selfMsgRes.status === 400 && selfMsgRes.data.success === false, 'Sending chat message to oneself rejected with 400');

    // 6. Validation: Empty message rejected
    const emptyMsgRes = await userAClient.post(`/api/v1/chat/conversations/${userBSlug}/messages`, {
      text: '   ',
    });
    assert(emptyMsgRes.status === 400 && emptyMsgRes.data.success === false, 'Sending whitespace-only message rejected with 400');

    // 7. Validation: Messaging non-existent user returns 404
    const notFoundRes = await userAClient.post('/api/v1/chat/conversations/non_existent_ghost_user_999/messages', {
      text: 'Hello anyone there?',
    });
    assert(notFoundRes.status === 404, 'Messaging non-existent user returns 404 Not Found');

    // 8. 2-Way Chat: Alice sends message to Bob
    const sendRes1 = await userAClient.post(`/api/v1/chat/conversations/${userBSlug}/messages`, {
      text: 'Hey Bob! I checked your portfolio and would like to collaborate.',
    });
    assert(sendRes1.status === 201 && sendRes1.data.success === true, 'Alice sends direct message to Bob (201 Created)');
    assert(sendRes1.data.data?.text === 'Hey Bob! I checked your portfolio and would like to collaborate.', 'Message payload matches sent text');

    // 9. Bob checks unread count: should be 1
    const unreadB1 = await userBClient.get('/api/v1/chat/unread-count');
    assert(unreadB1.status === 200 && unreadB1.data.data?.unreadCount === 1, 'Bob unread count increments to 1');

    // 10. Bob retrieves conversations list
    const convsResB = await userBClient.get('/api/v1/chat/conversations');
    assert(convsResB.status === 200 && convsResB.data.data?.conversations?.length === 1, 'Bob conversations list contains 1 active thread');
    const bConv = convsResB.data.data.conversations[0];
    assert(bConv.otherProfile?.username === userASlug, 'Conversation identifies Alice as the other profile');
    assert(bConv.lastMessage?.text.includes('collaborate'), 'Last message preview matches Alice message');
    assert(bConv.unreadCount === 1, 'Conversation reports unread count of 1 for Bob');

    // 11. Bob opens thread with Alice (fetches message history and marks read)
    const threadResB = await userBClient.get(`/api/v1/chat/conversations/${userASlug}`);
    assert(threadResB.status === 200 && threadResB.data.data?.messages?.length === 1, 'Bob opens thread with Alice, returning message history');
    assert(threadResB.data.data.targetProfile?.username === userASlug, 'Thread response contains target profile information');

    // 12. Unread count for Bob should now be 0 after opening thread
    const unreadBAfter = await userBClient.get('/api/v1/chat/unread-count');
    assert(unreadBAfter.status === 200 && unreadBAfter.data.data?.unreadCount === 0, 'Bob unread count resets to 0 after viewing thread');

    // 13. Bob replies to Alice
    const sendRes2 = await userBClient.post(`/api/v1/chat/conversations/${userASlug}/messages`, {
      text: 'Sounds fantastic Alice! Let us discuss the requirements.',
    });
    assert(sendRes2.status === 201 && sendRes2.data.success === true, 'Bob replies to Alice (201 Created)');

    // 14. Alice checks unread count: should be 1
    const unreadA1 = await userAClient.get('/api/v1/chat/unread-count');
    assert(unreadA1.status === 200 && unreadA1.data.data?.unreadCount === 1, 'Alice unread count increments to 1 after Bob reply');

    // 15. Alice fetches thread with Bob
    const threadResA = await userAClient.get(`/api/v1/chat/conversations/${userBSlug}`);
    assert(threadResA.status === 200 && threadResA.data.data?.messages?.length === 2, 'Alice thread reflects both messages in chronological order');
    assert(threadResA.data.data.messages[1].text === 'Sounds fantastic Alice! Let us discuss the requirements.', 'Second message in thread is Bob reply');

    // 16. Search users for chat discovery
    const searchRes = await userAClient.get(`/api/v1/chat/search-users?q=${userBSlug}`);
    assert(searchRes.status === 200 && searchRes.data.data?.users?.length >= 1, 'Alice searches creators and finds Bob');
    assert(searchRes.data.data.users[0].username === userBSlug, 'Search result matches Bob profile');

  } catch (err) {
    console.error('Tier 10 execution failure:', err);
    failed++;
  }

  console.log(`\nTier 10 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier10Tests;

if (require.main === module) {
  runTier10Tests();
}
