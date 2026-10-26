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

    // Check if user explicitly opted out of discovery
    const explicitlyHidden = await ProfileLookup.findOne({
      hashedPhone: hashed,
      allowDiscovery: false,
    });
    if (explicitlyHidden) {
      return res.status(404).json({
        success: false,
        message: 'No discoverable profile found for this phone number',
      });
    }

    // Query lookup table with allowDiscovery: true
    let lookup = await ProfileLookup.findOne({
      hashedPhone: hashed,
      allowDiscovery: true,
    });

    let profile = null;
    if (lookup) {
      profile = await Profile.findOne({
        _id: lookup.profileId,
        status: 'published',
      });
    }

    // Dynamic fallback: matches last 10 digits only if user opted in
    if (!profile) {
      const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-10);
      if (cleanDigits.length === 10) {
        const candidateProfile = await Profile.findOne({
          $or: [
            { 'contactDetails.phone': { $regex: cleanDigits } },
            { 'contactDetails.whatsapp': { $regex: cleanDigits } },
            { 'businessDetails.whatsappNumber': { $regex: cleanDigits } },
          ],
          status: 'published',
        });
        if (candidateProfile) {
          const candidateLookup = await ProfileLookup.findOne({
            profileId: candidateProfile._id,
          });
          if (candidateLookup && candidateLookup.allowDiscovery) {
            profile = candidateProfile;
          }
        }
      }
    }

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
    if (category && category !== 'All') {
      if (/real\s*estate/i.test(category)) {
        query.category = { $regex: /real\s*estate/i };
      } else if (/job|employment|recruitment/i.test(category)) {
        query.category = { $regex: /job|employment|recruitment/i };
      } else if (/custom/i.test(category)) {
        const standardCategories = [
          'IT & Software', 'Salon & Beauty', 'Fitness & Health', 'Doctor & Clinic',
          'Restaurant & Food', 'Professional Services', 'Education & Coaching',
          'Retail & Commerce', 'Grocery & Supermarket', 'Fashion & Apparel',
          'Electronics & Mobile', 'Automobile & Garage', 'Content Creator & Artist',
          'Real Estate', 'Jobs & Employment'
        ];
        query.$or = [
          { category: 'Custom Category' },
          { customCategory: { $exists: true, $ne: '' } },
          { category: { $nin: standardCategories } }
        ];
      } else {
        query.category = category;
      }
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
      .select('name username photoUrl profileType category subCategory city theme verifiedBadge followersCount businessDetails bio contactDetails completionPercentage')
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
