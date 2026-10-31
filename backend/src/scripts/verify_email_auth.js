const mongoose = require('mongoose');
const config = require('../config/env');
const app = require('../app');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');

const runVerification = async () => {
  console.log('🚀 Starting Comprehensive Email Authentication & Nodemailer Test Suite...\n');

  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB Atlas.');

    // Start ephemeral local server for HTTP request verification
    const testPort = 5999;
    const server = app.listen(testPort);
    const baseUrl = `http://127.0.0.1:${testPort}/api/v1/auth`;

    const stats = { passed: 0, failed: 0 };
    const assert = (condition, name) => {
      if (condition) {
        console.log(`  ✅ PASS: ${name}`);
        stats.passed++;
      } else {
        console.error(`  ❌ FAIL: ${name}`);
        stats.failed++;
      }
    };

    // 1. Super Admin Login
    console.log('\n--- 1. Testing Super Admin Authentication ---');
    const adminLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@myprofile.com', password: 'Admin@myprofile2026!' }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Super admin login returns HTTP 200');
    assert(adminLoginData.success === true, 'Admin login response has success = true');
    assert(adminLoginData.data?.user?.role === 'admin', 'Admin user role is verified as "admin"');
    assert(Boolean(adminLoginData.data?.token), 'Admin JWT token issued successfully');

    // 2. Admin Wrong Password
    console.log('\n--- 2. Testing Invalid Password Rejection ---');
    const wrongPassRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@myprofile.com', password: 'WrongPassword2026!' }),
    });
    assert(wrongPassRes.status === 401, 'Wrong password returns HTTP 401 Unauthorized');

    // 3. User Registration (Step 1: Request OTP)
    const testEmail = `evaluator_${Date.now()}@example.com`;
    console.log(`\n--- 3. Testing Registration OTP Request (${testEmail}) ---`);
    const regOtpRes = await fetch(`${baseUrl}/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, name: 'Evaluator User' }),
    });
    const regOtpData = await regOtpRes.json();
    assert(regOtpRes.status === 200, 'Request registration OTP returns HTTP 200');
    assert(Boolean(regOtpData.data?.devOtp), 'Dev OTP is dispatched and accessible in dev mode');
    const regOtp = regOtpData.data?.devOtp || '123456';

    // 4. User Registration (Step 2: Verify OTP & Set Password)
    console.log('\n--- 4. Testing Registration Verification & Password Setup ---');
    const regVerifyRes = await fetch(`${baseUrl}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp: regOtp,
        password: 'SecurePassword2026!',
        name: 'Evaluator User',
        profileType: 'Engineer',
      }),
    });
    const regVerifyData = await regVerifyRes.json();
    assert(regVerifyRes.status === 200, 'Registration verify returns HTTP 200');
    assert(Boolean(regVerifyData.data?.token), 'User JWT token returned');
    assert(regVerifyData.data?.profile?.name === 'Evaluator User', 'Auto-created profile matches user name');
    assert(regVerifyData.data?.profile?.status === 'published', 'Auto-created profile is published');
    assert(regVerifyData.data?.sections?.length >= 3, 'Starter modular sections seeded');

    const testUserToken = regVerifyData.data?.token;
    const testUserId = regVerifyData.data?.user?.id;

    // 5. Duplicate Registration Check
    console.log('\n--- 5. Testing Duplicate Registration Prevention ---');
    const dupRegRes = await fetch(`${baseUrl}/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, name: 'Duplicate User' }),
    });
    assert(dupRegRes.status === 409, 'Duplicate email registration request rejected with HTTP 409');

    // 6. Login with Newly Registered User
    console.log('\n--- 6. Testing Login with New Credentials ---');
    const newLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'SecurePassword2026!' }),
    });
    const newLoginData = await newLoginRes.json();
    assert(newLoginRes.status === 200, 'New user login succeeds with HTTP 200');
    assert(newLoginData.data?.user?.email === testEmail, 'Logged in user email matches');

    // 7. Forgot Password (Step 1: Request Reset OTP)
    console.log('\n--- 7. Testing Forgot Password Request ---');
    const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();
    assert(forgotRes.status === 200, 'Forgot password request returns HTTP 200');
    assert(Boolean(forgotData.data?.devOtp), 'Reset OTP dispatched successfully');
    const resetOtp = forgotData.data?.devOtp || '123456';

    // 8. Reset Password with OTP
    console.log('\n--- 8. Testing Reset Password Verification ---');
    const resetRes = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp: resetOtp,
        newPassword: 'BrandNewPassword2026!',
      }),
    });
    assert(resetRes.status === 200, 'Password reset confirmation returns HTTP 200');

    // 9. Old Password Invalidation Check
    console.log('\n--- 9. Testing Old Password Invalidation ---');
    const oldLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'SecurePassword2026!' }),
    });
    assert(oldLoginRes.status === 401, 'Old password fails with HTTP 401 Unauthorized');

    // 10. New Password Login Check
    console.log('\n--- 10. Testing Login with New Password ---');
    const newPassLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'BrandNewPassword2026!' }),
    });
    const newPassData = await newPassLoginRes.json();
    assert(newPassLoginRes.status === 200, 'Login with new password succeeds with HTTP 200');
    const refreshedToken = newPassData.data?.token;

    // 11. Profile & Session Retrieval (GET /auth/me)
    console.log('\n--- 11. Testing Session Retrieval (GET /auth/me) ---');
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${refreshedToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /auth/me returns HTTP 200');
    assert(meData.data?.user?.email === testEmail, 'GET /auth/me returns correct user email');
    assert(Boolean(meData.data?.profile), 'GET /auth/me returns associated profile');

    // 12. Suspended Account Check
    console.log('\n--- 12. Testing Suspended Account Handling ---');
    await User.updateOne({ _id: testUserId }, { accountStatus: 'suspended' });
    const suspendedLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'BrandNewPassword2026!' }),
    });
    assert(suspendedLoginRes.status === 403, 'Suspended account login is blocked with HTTP 403 Forbidden');

    // 13. Edge Cases & Boundary Validation
    console.log('\n--- 13. Testing Auth Edge Cases & Input Validation ---');

    // 13.1 Non-existent user login
    const nonExistentLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_user_999@example.com', password: 'AnyPassword123!' }),
    });
    assert(nonExistentLogin.status === 401, 'Non-existent email login returns HTTP 401');

    // 13.2 Invalid email format
    const invalidEmailRes = await fetch(`${baseUrl}/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email-format', name: 'Bad Email' }),
    });
    assert(invalidEmailRes.status === 400, 'Malformed email in request-otp rejected with HTTP 400');

    // 13.3 Password shorter than 6 characters
    const shortPassRes = await fetch(`${baseUrl}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '123456', password: '123' }),
    });
    assert(shortPassRes.status === 400, 'Password shorter than 6 chars rejected with HTTP 400');

    // 13.4 Non-existent account forgot password
    const ghostForgotRes = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_account_xyz@example.com' }),
    });
    assert(ghostForgotRes.status === 404, 'Forgot password for non-existent account returns HTTP 404');

    // 13.5 Password reset with wrong OTP
    const wrongResetOtpRes = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000', newPassword: 'BrandNewValidPass123!' }),
    });
    assert(wrongResetOtpRes.status === 400, 'Password reset with wrong OTP returns HTTP 400');

    // 13.6 Unverified account login block
    const unverifiedEmail = `unverified_${Date.now()}@example.com`;
    await fetch(`${baseUrl}/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unverifiedEmail, name: 'Unverified User' }),
    });
    const unverifiedLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unverifiedEmail, password: 'AnyPassword123!' }),
    });
    assert(unverifiedLoginRes.status === 401, 'Unverified account login blocked with HTTP 401');

    // 14. Clean up test users
    console.log('\n--- Cleaning up temporary test artifacts ---');
    const testProfile = await Profile.findOne({ userId: testUserId });
    if (testProfile) {
      await Section.deleteMany({ profileId: testProfile._id });
      await Profile.deleteOne({ _id: testProfile._id });
    }
    await User.deleteOne({ _id: testUserId });
    await User.deleteOne({ email: unverifiedEmail });
    console.log('Test artifacts removed.');

    server.close();
    await mongoose.connection.close();

    console.log('\n========================================');
    console.log(`🎯 Test Results: ${stats.passed} Passed, ${stats.failed} Failed`);
    console.log('========================================\n');

    if (stats.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runVerification();
