const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const ProfileLookup = require('../models/ProfileLookup');
const config = require('../config/env');
const mailer = require('../config/mailer');
const { generateToken } = require('../utils/jwt');
const { hashPhone, normalizePhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
};

/**
 * Helper to construct standard authentication response with linked profile, sections, and reels
 */
const buildAuthResponseData = async (user, fallbackProfileData = {}) => {
  let profile = await Profile.findOne({ userId: user._id });

  if (!profile) {
    const resolvedName = fallbackProfileData.name?.trim() || user.name || 'New Creator';
    const resolvedBio = fallbackProfileData.bio?.trim() || 'Digital Creator building interactive experiences and modern solutions.';
    const validProfileTypes = [
      'Personal', 'Creator', 'Student', 'Sportsperson', 'Teacher',
      'Professional', 'Freelancer', 'ServiceProvider', 'SmallBusiness',
      'Engineer', 'Designer', 'StoreOwner', 'Businessman'
    ];

    let resolvedProfileType = 'Creator';
    if (fallbackProfileData.profileType && validProfileTypes.includes(fallbackProfileData.profileType)) {
      resolvedProfileType = fallbackProfileData.profileType;
    }

    const resolvedCategory = fallbackProfileData.category?.trim() || 'Content Creator & Artist';
    const sanitizedName = resolvedName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 14);
    const defaultSlug = `${sanitizedName || 'user'}_${Math.random().toString(36).substring(2, 6)}`;
    const profileWebUrl = config.frontendUrl ? `${config.frontendUrl}/p/${defaultSlug}` : `http://localhost:8081/p/${defaultSlug}`;
    
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await generateQRCodeDataURL(profileWebUrl);
    } catch (e) {
      console.log('QR generation notice in authController:', e.message);
    }

    profile = new Profile({
      userId: user._id,
      name: resolvedName,
      username: defaultSlug,
      profileType: resolvedProfileType,
      category: resolvedCategory,
      customCategory: fallbackProfileData.customCategory?.trim() || '',
      status: 'published',
      bio: resolvedBio,
      city: 'India',
      theme: 'default',
      completionPercentage: 85,
      qrCodeUrl,
      contactDetails: {
        email: user.email,
        showEmail: true,
      },
      socialLinks: [
        { platform: 'website', url: 'https://example.com' },
        { platform: 'github', url: 'https://github.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
      ],
    });
    profile.calculateCompletion();
    await profile.save();

    // Starter modular sections
    try {
      await Section.create([
        {
          profileId: profile._id,
          type: 'about',
          title: 'About Me',
          content: { text: resolvedBio },
          order: 0,
          visibility: 'public',
        },
        {
          profileId: profile._id,
          type: 'skills',
          title: 'Core Skills & Competencies',
          content: { items: ['Product Strategy', 'React & Mobile', 'Cloud Engineering', 'Problem Solving', 'UI/UX Design'] },
          order: 1,
          visibility: 'public',
        },
        {
          profileId: profile._id,
          type: 'experience',
          title: 'Experience & Roles',
          content: {
            items: [
              { role: 'Specialist & Creator', company: 'Digital Innovations', period: '2023 - Present', description: 'Architecting modern web solutions and creator experiences.' },
            ],
          },
          order: 2,
          visibility: 'public',
        },
        {
          profileId: profile._id,
          type: 'portfolio',
          title: 'Featured Projects',
          content: {
            items: [
              { title: 'MyProfile App', description: 'Modern digital identity platform with mobile reels & passwordless OTP.', link: 'https://example.com' },
            ],
          },
          order: 3,
          visibility: 'public',
        },
      ]);
    } catch (secErr) {
      console.log('Starter sections notice:', secErr.message);
    }
  }

  const sections = await Section.find({ profileId: profile._id }).sort({ order: 1 });
  const reels = await Reel.find({ profileId: profile._id, status: 'active' }).sort({ createdAt: -1 });

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name || profile.name,
      role: user.role,
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
      mobile: user.mobile,
    },
    profile: {
      id: profile._id,
      _id: profile._id,
      name: profile.name,
      username: profile.username,
      photoUrl: profile.photoUrl || '',
      profileType: profile.profileType,
      category: profile.category || 'IT & Software',
      customCategory: profile.customCategory || '',
      subCategory: profile.subCategory || '',
      bio: profile.bio || '',
      city: profile.city || 'India',
      theme: profile.theme || 'default',
      status: profile.status || 'published',
      completionPercentage: profile.completionPercentage || 75,
      qrCodeUrl: profile.qrCodeUrl || '',
      qrCodeDataUrl: profile.qrCodeUrl || '',
      socialLinks: profile.socialLinks || [],
      contactDetails: profile.contactDetails || {},
      businessDetails: profile.businessDetails || {},
      verifiedBadge: profile.verifiedBadge || 'verified_pro',
      isVerifiedBadge: Boolean(profile.isVerifiedBadge ?? true),
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
      testimonials: profile.testimonials || [],
    },
    sections,
    reels,
  };
};

/**
 * 1. Request Registration OTP
 * POST /api/v1/auth/register/request-otp
 * Body: { email, name }
 */
const registerRequestOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(409).json({
        success: false,
        code: 'USER_ALREADY_EXISTS',
        message: 'An account is already registered with this email. Please sign in.',
      });
    }

    if (user && user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    if (!user) {
      user = new User({
        email: normalizedEmail,
        name: name?.trim() || '',
        role: normalizedEmail === 'admin@myprofile.com' ? 'admin' : 'user',
        isVerified: false,
      });
    } else if (name) {
      user.name = name.trim();
    }

    // Generate 6-digit OTP code & 10 min expiration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code,
      expiresAt,
      attempts: 0,
      purpose: 'registration',
    };
    await user.save();

    // Send styled HTML email via Nodemailer
    const mailResult = await mailer.sendRegistrationOtp(normalizedEmail, code);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address',
      data: {
        email: normalizedEmail,
        devOtp: mailResult.devOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Verify Registration OTP & Set Password
 * POST /api/v1/auth/register/verify
 * Body: { email, otp, password, name, bio, profileType, category, customCategory }
 */
const registerVerify = async (req, res, next) => {
  try {
    const {
      email,
      otp,
      password,
      name,
      bio,
      profileType,
      category,
      customCategory,
    } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otp || !user.otp.code || user.otp.purpose !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'No pending registration request found for this email. Please request a new OTP.',
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new verification code.',
      });
    }

    if (user.otp.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed verification attempts. Please request a new OTP.',
      });
    }

    const isDev = config.otpMode === 'dev';
    const isMatch = user.otp.code === otp || (isDev && otp === '123456');

    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    // Set password (hashed automatically by pre-save hook) and verify
    user.password = password;
    user.isVerified = true;
    user.otp = undefined;
    if (name) user.name = name.trim();
    if (normalizedEmail === 'admin@myprofile.com') user.role = 'admin';
    await user.save();

    const authData = await buildAuthResponseData(user, {
      name: name || user.name,
      bio,
      profileType,
      category,
      customCategory,
    });

    return res.status(200).json({
      success: true,
      message: 'Account created and profile published successfully!',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Direct Sign-In with Email and Password
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Account is not verified. Please complete email verification.',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Password is not set for this account. Please use "Forgot Password" to set a secure password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const authData = await buildAuthResponseData(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Forgot Password - Send Reset OTP
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'No account registered with this email address.',
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email address is not yet verified. Please complete registration first.',
      });
    }

    // Generate 6-digit OTP code & 10 min expiration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code,
      expiresAt,
      attempts: 0,
      purpose: 'forgot_password',
    };
    await user.save();

    // Send styled HTML reset email via Nodemailer
    const mailResult = await mailer.sendPasswordResetOtp(normalizedEmail, code);

    return res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email address',
      data: {
        email: normalizedEmail,
        devOtp: mailResult.devOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Reset Password with OTP
 * POST /api/v1/auth/reset-password
 * Body: { email, otp, newPassword }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.otp || !user.otp.code || user.otp.purpose !== 'forgot_password') {
      return res.status(400).json({
        success: false,
        message: 'No pending password reset request found for this email. Please request a new code.',
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Password reset code has expired. Please request a new one.',
      });
    }

    if (user.otp.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed reset attempts. Please request a new OTP.',
      });
    }

    const isDev = config.otpMode === 'dev';
    const isMatch = user.otp.code === otp || (isDev && otp === '123456');

    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset code',
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Get Current Authenticated User & Profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name || profile?.name,
          role: req.user.role,
          isVerified: req.user.isVerified,
          accountStatus: req.user.accountStatus,
          mobile: req.user.mobile,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy Mobile / Direct OTP Fallbacks
 */
const requestOtp = async (req, res, next) => {
  if (req.body.email) {
    return registerRequestOtp(req, res, next);
  }
  try {
    const { mobile, countryCode = '+91' } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number or email is required' });
    }
    const normalized = normalizePhone(mobile, countryCode);
    let user = await User.findOne({ mobile: normalized });
    if (user && user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: `Your account is ${user.accountStatus}. Please contact support.` });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    if (!user) {
      user = new User({ email: `user_${Date.now()}@myprofile.com`, mobile: normalized, countryCode, role: 'user' });
    }
    user.otp = { code, expiresAt, attempts: 0, purpose: 'verification' };
    await user.save();
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { mobile: normalized, devOtp: config.otpMode === 'dev' ? code : undefined },
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, mobile, otp, countryCode = '+91' } = req.body;
    let user = null;
    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (mobile) {
      user = await User.findOne({ mobile: normalizePhone(mobile, countryCode) });
    } else {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'No pending OTP request found' });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: `Your account is ${user.accountStatus}. Please contact support.` });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No pending OTP request found' });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isDev = config.otpMode === 'dev';
    const isMatch = user.otp.code === otp || (isDev && otp === '123456');
    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const authData = await buildAuthResponseData(user);
    return res.status(200).json({ success: true, message: 'Authentication successful', data: authData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerRequestOtp,
  registerVerify,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  requestOtp,
  verifyOtp,
};
