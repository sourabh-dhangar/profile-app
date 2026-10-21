const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const ProfileLookup = require('../models/ProfileLookup');
const config = require('../config/env');
const { generateOtp, getOtpExpiry, sendOtp } = require('../utils/otp');
const { generateToken } = require('../utils/jwt');
const { normalizePhone, hashPhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');

/**
 * Request OTP
 * POST /api/v1/auth/request-otp
 * Body: { mobile, countryCode }
 */
const requestOtp = async (req, res, next) => {
  try {
    let { mobile, countryCode = '+91' } = req.body;
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    const normalized = normalizePhone(mobile, countryCode);

    // Find or create user
    let user = await User.findOne({ mobile: normalized });
    if (!user) {
      user = new User({
        mobile: normalized,
        countryCode,
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Generate and store OTP
    const code = generateOtp();
    const expiresAt = getOtpExpiry();

    user.otp = {
      code,
      expiresAt,
      attempts: 0,
    };
    await user.save();

    await sendOtp(normalized, code);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        mobile: normalized,
        // In dev mode, return code to speed up testing
        devOtp: config.otpMode === 'dev' ? code : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 * POST /api/v1/auth/verify-otp
 * Body: { mobile, otp, countryCode }
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, countryCode = '+91' } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required',
      });
    }

    const normalized = normalizePhone(mobile, countryCode);
    const user = await User.findOne({ mobile: normalized });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: 'No pending OTP request found for this mobile number',
      });
    }

    // Check expiration
    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check attempts limit (e.g. 5 failed tries)
    if (user.otp.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Check code match (or dev mock 123456)
    const isDev = config.otpMode === 'dev';
    const isMatch = user.otp.code === otp || (isDev && otp === '123456');

    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code',
      });
    }

    // Verification successful
    user.isVerified = true;
    user.otp = undefined; // clear OTP
    await user.save();

    // Check if profile exists, if not create default isolated published profile
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      // Generate a unique fallback username based on timestamp & random string
      const defaultSlug = `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
      const profileWebUrl = config.frontendUrl ? `${config.frontendUrl}/p/${defaultSlug}` : `http://localhost:8081/p/${defaultSlug}`;
      let qrCodeUrl = '';
      try {
        qrCodeUrl = await generateQRCodeDataURL(profileWebUrl);
      } catch (e) {
        console.log('QR generation error in authController:', e.message);
      }

      profile = new Profile({
        userId: user._id,
        name: 'New Creator',
        username: defaultSlug,
        profileType: 'Creator',
        status: 'published',
        bio: 'Digital Creator building interactive experiences and modern solutions.',
        city: 'India',
        theme: 'default',
        completionPercentage: 80,
        qrCodeUrl,
        contactDetails: {
          phone: normalized,
          whatsapp: normalized,
          showPhone: false,
          showWhatsapp: true,
          showEmail: false,
        },
        socialLinks: [
          { platform: 'website', url: 'https://example.com' },
          { platform: 'github', url: 'https://github.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
        ],
      });
      profile.calculateCompletion();
      await profile.save();

      // Auto-seed rich starter modular sections for this user's profile
      try {
        await Section.create([
          {
            profileId: profile._id,
            type: 'about',
            title: 'About Me',
            content: { text: 'Welcome to my digital profile! I share my professional work, skills, and projects here.' },
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
        console.log('Error creating starter sections:', secErr.message);
      }

      // Add to ProfileLookup for phone discovery
      try {
        await ProfileLookup.create({
          hashedPhone: hashPhone(normalized),
          profileId: profile._id,
          allowDiscovery: false,
        });
      } catch (lookupErr) {
        // Ignore duplicate if already registered
      }
    }

    // Fetch this user's isolated sections and reels
    const sections = await Section.find({ profileId: profile._id }).sort({ order: 1 });
    const reels = await Reel.find({ profileId: profile._id, status: 'active' }).sort({ createdAt: -1 });

    // Generate JWT
    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.isVerified,
          accountStatus: user.accountStatus,
        },
        profile: {
          id: profile._id,
          name: profile.name,
          username: profile.username,
          photoUrl: profile.photoUrl,
          profileType: profile.profileType,
          bio: profile.bio,
          city: profile.city,
          theme: profile.theme,
          status: profile.status,
          completionPercentage: profile.completionPercentage,
          qrCodeUrl: profile.qrCodeUrl,
          socialLinks: profile.socialLinks,
          contactDetails: profile.contactDetails,
        },
        sections,
        reels,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details
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
          mobile: req.user.mobile,
          role: req.user.role,
          isVerified: req.user.isVerified,
          accountStatus: req.user.accountStatus,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  getMe,
};
