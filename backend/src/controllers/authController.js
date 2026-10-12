const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateOtp, getOtpExpiry, sendOtp } = require('../utils/otp');
const { generateToken } = require('../utils/jwt');
const { normalizePhone } = require('../utils/crypto');

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
        devOtp: process.env.OTP_MODE === 'dev' ? code : undefined,
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
    const isDev = process.env.OTP_MODE === 'dev';
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

    // Check if profile exists, if not create default draft profile
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      // Generate a unique fallback username based on timestamp & random string
      const defaultSlug = `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
      profile = new Profile({
        userId: user._id,
        name: 'New User',
        username: defaultSlug,
        profileType: 'Personal',
        status: 'draft',
        contactDetails: {
          phone: normalized,
          showPhone: false,
        },
      });
      profile.calculateCompletion();
      await profile.save();
    }

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
          status: profile.status,
          completionPercentage: profile.completionPercentage,
        },
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
