const ProfileLookup = require('../models/ProfileLookup');
const Profile = require('../models/Profile');
const { hashPhone } = require('../utils/crypto');

/**
 * Search Profile by Phone Number
 * POST /api/v1/discovery/search-by-phone
 * Rate-limited: max 5 requests per minute
 * Body: { phone, countryCode }
 */
const searchByPhone = async (req, res, next) => {
  try {
    const { phone, countryCode = '+91' } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const hashed = hashPhone(phone, countryCode);

    // Query lookup table
    const lookup = await ProfileLookup.findOne({
      hashedPhone: hashed,
      allowDiscovery: true,
    });

    // PRIVACY ENFORCEMENT: identical 404 for not found OR opted out
    if (!lookup) {
      return res.status(404).json({
        success: false,
        message: 'No discoverable profile found for this phone number',
      });
    }

    // Retrieve published profile
    const profile = await Profile.findOne({
      _id: lookup.profileId,
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No discoverable profile found for this phone number',
      });
    }

    // Return sanitized public fields only — never leak phone or private data
    res.status(200).json({
      success: true,
      data: {
        name: profile.name,
        username: profile.username,
        photoUrl: profile.photoUrl,
        profileType: profile.profileType,
        bio: profile.bio,
        city: profile.city,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's phone discovery settings
 * GET /api/v1/discovery/settings
 */
const getDiscoverySettings = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const hashed = hashPhone(req.user.mobile, req.user.countryCode);
    const lookup = await ProfileLookup.findOne({ hashedPhone: hashed });

    res.status(200).json({
      success: true,
      data: {
        allowDiscovery: lookup ? lookup.allowDiscovery : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update phone discovery opt-in / opt-out setting
 * PUT /api/v1/discovery/settings
 * Body: { allowDiscovery: boolean }
 */
const updateDiscoverySettings = async (req, res, next) => {
  try {
    const { allowDiscovery } = req.body;
    if (typeof allowDiscovery !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'allowDiscovery must be a boolean value (true or false)',
      });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const hashed = hashPhone(req.user.mobile, req.user.countryCode);

    // Upsert lookup entry
    const lookup = await ProfileLookup.findOneAndUpdate(
      { hashedPhone: hashed },
      {
        hashedPhone: hashed,
        profileId: profile._id,
        allowDiscovery,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: allowDiscovery
        ? 'Phone discovery enabled. Others with your number can find your profile.'
        : 'Phone discovery disabled. Your profile cannot be searched by phone number.',
      data: {
        allowDiscovery: lookup.allowDiscovery,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Browse profiles by category, city, or keyword search
 * GET /api/v1/discovery/browse?category=...&city=...&search=...
 */
const browseProfiles = async (req, res, next) => {
  try {
    const { category, search, city, limit = 20, page = 1 } = req.query;
    const query = { status: 'published' };
    if (category) {
      query.category = category;
    }
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { subCategory: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
      ];
    }
    const profiles = await Profile.find(query)
      .select('name username photoUrl profileType category subCategory city theme verifiedBadge followersCount businessDetails')
      .sort({ followersCount: -1, updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Profile.countDocuments(query);
    res.status(200).json({
      success: true,
      data: {
        profiles,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchByPhone,
  getDiscoverySettings,
  updateDiscoverySettings,
  browseProfiles,
};
