const TestClient = require('./test-client');

async function runTier6Tests() {
  console.log('\n=== RUNNING TIER 6: DIRECT VISITOR INQUIRIES & MESSAGING TESTS ===\n');
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
    const testPhone = '9666' + Math.floor(100000 + Math.random() * 900000);
    await client.post('/api/v1/auth/request-otp', { mobile: testPhone });
    const verifyRes = await client.post('/api/v1/auth/verify-otp', { mobile: testPhone, otp: '123456' });
    const token = verifyRes.data.data.token;
    client.setToken(token);

    const testSlug = 'inq_creator_' + Date.now().toString(36);

    // Initial setup & publish
    await client.put('/api/v1/profiles/me', {
      name: 'Inquiry Creator',
      username: testSlug,
      bio: 'Ready to receive client inquiries.',
      city: 'Mumbai',
      profileType: 'Freelancer',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      contactDetails: {
        email: 'creator@example.com',
        phone: '+919876543210',
        showEmail: true,
      },
    });

    const pubRes = await client.post('/api/v1/profiles/me/publish');
    assert(pubRes.status === 200, 'Creator profile published for public inquiries');

    // 1. Submit Visitor Inquiry (Public client)
    const visitorClient = new TestClient('http://localhost:5000');
    const inqRes = await visitorClient.post(`/api/v1/profiles/${testSlug}/inquiries`, {
      senderName: 'Jane Client',
      senderEmail: 'jane@enterprise.com',
      senderPhone: '+919123456789',
      subject: 'Freelance Project Opportunity',
      message: 'Hello, we would love to hire you for our upcoming web design project!',
    });
    assert(inqRes.status === 201 && inqRes.data.success === true, 'Visitor successfully submits inquiry message (201 Created)');
    assert(inqRes.data.data?.status === 'unread', 'New inquiry defaults to unread status');
    const createdInquiryId = inqRes.data.data?._id;

    // 2. Submit second inquiry
    await visitorClient.post(`/api/v1/profiles/${testSlug}/inquiries`, {
      senderName: 'John Recruiter',
      senderEmail: 'john@agency.com',
      message: 'Quick question regarding your availability next month.',
    });

    // 3. Validation: Missing required message/email
    const invalidInq = await visitorClient.post(`/api/v1/profiles/${testSlug}/inquiries`, {
      senderName: 'Incomplete User',
      message: '',
    });
    assert(invalidInq.status === 400, 'Inquiry submission without required fields returns 400 Bad Request');

    // 4. Inquiry to non-existent profile
    const nonExistentInq = await visitorClient.post('/api/v1/profiles/nobody_home_slug_999/inquiries', {
      senderName: 'Visitor',
      senderEmail: 'visitor@example.com',
      message: 'Hello?',
    });
    assert(nonExistentInq.status === 404, 'Inquiry to non-existent profile returns 404 Not Found');

    // 5. Creator retrieves inbox
    const inboxRes = await client.get('/api/v1/profiles/me/inquiries');
    assert(inboxRes.status === 200, 'GET /api/v1/profiles/me/inquiries returns 200 OK');
    assert(Array.isArray(inboxRes.data.data.inquiries) && inboxRes.data.data.inquiries.length >= 2, 'Inbox contains submitted messages');
    assert(inboxRes.data.data.unreadCount >= 2, 'Inbox unreadCount accurately reflects unread messages');

    // 6. Creator updates status to read
    const updateStatusRes = await client.put(`/api/v1/profiles/me/inquiries/${createdInquiryId}/status`, {
      status: 'read',
    });
    assert(updateStatusRes.status === 200 && updateStatusRes.data.data.status === 'read', 'Creator marks inquiry as read');

    // 7. Verify unreadCount decreased
    const inboxAfterRead = await client.get('/api/v1/profiles/me/inquiries');
    assert(inboxAfterRead.data.data.unreadCount === inboxRes.data.data.unreadCount - 1, 'Unread count decreases after marking inquiry read');

    // 8. Filter by status
    const unreadOnly = await client.get('/api/v1/profiles/me/inquiries?status=unread');
    assert(unreadOnly.status === 200 && unreadOnly.data.data.inquiries.every(i => i.status === 'unread'), 'Query status filter returns only matching inquiries');

    // 9. Boundary: Invalid status rejected
    const invalidStatus = await client.put(`/api/v1/profiles/me/inquiries/${createdInquiryId}/status`, {
      status: 'invalid_status_enum',
    });
    assert(invalidStatus.status === 400, 'Invalid status update returns 400 Bad Request');

    // 10. Boundary: Unauthenticated access rejected
    const unauthInbox = await visitorClient.get('/api/v1/profiles/me/inquiries');
    assert(unauthInbox.status === 401, 'Unauthenticated access to /me/inquiries strictly rejected with 401');

  } catch (err) {
    console.error('Unhandled exception in Tier 6 tests:', err);
    failed++;
  }

  console.log(`\nTier 6 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier6Tests;

if (require.main === module) {
  runTier6Tests().then(res => {
    process.exit(res.failed === 0 ? 0 : 1);
  });
}
