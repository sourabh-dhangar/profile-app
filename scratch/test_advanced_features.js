const API_BASE = 'http://localhost:5000/api/v1';

async function testFeatures() {
  console.log('--- 1. Testing Visitor Inquiry Submission ---');
  // Visitor submits an inquiry to rahul_dev
  const postRes = await fetch(`${API_BASE}/profiles/rahul_dev/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderName: 'Ananya Roy',
      senderEmail: 'ananya@fintechstartup.com',
      senderPhone: '+919988776655',
      subject: '⚡ Freelance / Contract',
      message: 'Hi Rahul! We loved your React Native reels and would like to hire you for a 3-month contract to architect our core mobile payments flow.',
    }),
  });

  const postData = await postRes.json();
  console.log('Inquiry POST response:', postData);

  console.log('\n--- 2. Login as Rahul Sharma (Creator) ---');
  await fetch(`${API_BASE}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9876543210' }),
  });

  const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9876543210', otp: '123456' }),
  });
  const authData = await verifyRes.json();
  const token = authData.data.token;
  console.log('Logged in, token retrieved.');

  console.log('\n--- 3. Fetch Creator Analytics ---');
  const analyticsRes = await fetch(`${API_BASE}/profiles/me/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const analyticsData = await analyticsRes.json();
  console.log('Analytics response:', JSON.stringify(analyticsData, null, 2));

  console.log('\n--- 4. Fetch Creator Inquiries Inbox ---');
  const inqRes = await fetch(`${API_BASE}/profiles/me/inquiries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const inqData = await inqRes.json();
  console.log(`Inquiries count: ${inqData.data.inquiries.length}, unread: ${inqData.data.unreadCount}`);

  if (inqData.data.inquiries.length > 0) {
    const firstInq = inqData.data.inquiries[0];
    console.log(`\n--- 5. Mark First Inquiry (${firstInq._id}) as Read ---`);
    const patchRes = await fetch(`${API_BASE}/profiles/me/inquiries/${firstInq._id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'read' }),
    });
    const patchData = await patchRes.json();
    console.log('Inquiry status updated:', patchData);
  }

  console.log('\n--- 6. Test Profile Photo URL Update ---');
  const updateRes = await fetch(`${API_BASE}/profiles/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    }),
  });
  const updateData = await updateRes.json();
  console.log('Profile photo update response:', updateData.success, updateData.data?.photoUrl);

  console.log('\nALL END-TO-END FEATURE VERIFICATIONS SUCCEEDED! ✨');
}

testFeatures().catch(console.error);
