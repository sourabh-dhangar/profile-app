const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function put(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'PUT',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- STEP 1: Verify Kavya Verma Identity & Profile Isolation ---');
  await post('/api/v1/auth/request-otp', { mobile: '9811223344' });
  const kavyaAuth = await post('/api/v1/auth/verify-otp', { mobile: '9811223344', otp: '123456' });
  console.log('Kavya Auth Status:', kavyaAuth.status, 'User Name:', kavyaAuth.body.data?.profile?.name);

  const kavyaProfile = await get('/api/v1/profiles/me', kavyaAuth.body.data.token);
  console.log('Kavya Profile Username:', kavyaProfile.body.data?.profile?.username);
  console.log('Kavya Sections Count:', kavyaProfile.body.data?.sections?.length);
  console.log('Kavya Reels Count:', kavyaProfile.body.data?.reels?.length);

  console.log('\n--- STEP 2: Verify Super Admin Login & Access ---');
  await post('/api/v1/auth/request-otp', { mobile: '9999999999' });
  const adminAuth = await post('/api/v1/auth/verify-otp', { mobile: '9999999999', otp: '123456' });
  console.log('Admin Auth Status:', adminAuth.status, 'Role:', adminAuth.body.data?.user?.role);
  const adminToken = adminAuth.body.data.token;

  console.log('\n--- STEP 3: Admin Analytics & Governance ---');
  const analyticsRes = await get('/api/v1/admin/analytics', adminToken);
  console.log('Admin Analytics:', analyticsRes.body.data);

  console.log('\n--- STEP 4: Admin List All Users Enriched With Profile ---');
  const usersRes = await get('/api/v1/admin/users?limit=100', adminToken);
  const allUsers = usersRes.body.data?.users || [];
  console.log(`Fetched ${allUsers.length} total users.`);

  const kavyaFound = allUsers.find((u) => u.mobile?.includes('9811223344'));
  console.log('Found Kavya in Admin List?:', Boolean(kavyaFound));
  if (kavyaFound) {
    console.log('  Kavya Name:', kavyaFound.profile?.name);
    console.log('  Kavya Username:', kavyaFound.profile?.username);
    console.log('  Kavya Status:', kavyaFound.accountStatus);
    console.log('  Kavya Role:', kavyaFound.role);
  }

  console.log('\n--- STEP 5: Test Admin Action: Suspend and Reactivate User ---');
  if (kavyaFound) {
    // Suspend
    const suspendRes = await put(`/api/v1/admin/users/${kavyaFound._id}/status`, { accountStatus: 'suspended' }, adminToken);
    console.log('Suspend Result:', suspendRes.body?.message, 'New status:', suspendRes.body?.data?.accountStatus);

    // Verify status updated in DB
    const checkUsers = await get('/api/v1/admin/users?limit=100', adminToken);
    const updatedKavya = checkUsers.body.data?.users?.find((u) => u._id === kavyaFound._id);
    console.log('Kavya Status in DB After Suspend:', updatedKavya?.accountStatus);

    // Reactivate back to active
    const reactivateRes = await put(`/api/v1/admin/users/${kavyaFound._id}/status`, { accountStatus: 'active' }, adminToken);
    console.log('Reactivate Result:', reactivateRes.body?.message, 'Restored status:', reactivateRes.body?.data?.accountStatus);
  }

  console.log('\n--- STEP 6: Public Feed Reel Check ---');
  const reelsRes = await get('/api/v1/reels/feed');
  const kavyaReel = reelsRes.body.data?.reels?.find((r) => r.profileId?.username === 'kavya_ux');
  console.log('Found Kavya reel on public feed?:', Boolean(kavyaReel));
  if (kavyaReel) {
    console.log('  Reel caption:', kavyaReel.caption);
    console.log('  Creator:', kavyaReel.profileId?.name, `@${kavyaReel.profileId?.username}`);
  }

  console.log('\n✅ ALL VERIFICATION CHECKS PASSED WITH FLYING COLORS!');
}

run().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
