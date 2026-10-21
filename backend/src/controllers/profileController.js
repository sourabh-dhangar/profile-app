const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const Inquiry = require('../models/Inquiry');
const Follow = require('../models/Follow');
const { createNotificationHelper } = require('./notificationController');
const config = require('../config/env');

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'api', 'dashboard', 'login', 'signup',
  'register', 'auth', 'reels', 'feed', 'discover', 'discovery', 'settings',
  'profile', 'profiles', 'p', 'help', 'support', 'terms', 'privacy',
  'about', 'contact', 'system', 'me', 'inquiries', 'analytics', 'null',
  'undefined', 'test', 'official', 'app', 'myprofile'
];

const { generateQRCodeDataURL } = require('../utils/qr');
const { generateVCard } = require('../utils/vcard');

/**
 * Get My Profile
 * GET /api/v1/profiles/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const sections = await Section.find({ profileId: profile._id }).sort({ order: 1 });
    const reels = await Reel.find({ profileId: profile._id, status: 'active' }).sort({ isPinned: -1, createdAt: -1 });
    const reelsCount = reels.length;

    res.status(200).json({
      success: true,
      data: {
        profile,
        sections,
        reels,
        stats: {
          reelsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update My Profile
 * PUT /api/v1/profiles/me
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const {
      name,
      username,
      bio,
      city,
      profileType,
      category,
      subCategory,
      businessDetails,
      socialLinks,
      contactDetails,
      theme,
    } = req.body;

    // Check username conflict if changed
    if (username && username.toLowerCase().trim() !== profile.username) {
      const cleanUser = username.toLowerCase().trim();
      if (RESERVED_USERNAMES.includes(cleanUser)) {
        return res.status(400).json({
          success: false,
          message: 'Username is reserved and cannot be claimed',
        });
      }
      const existing = await Profile.findOne({ username: cleanUser });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken',
        });
      }
      profile.username = username.toLowerCase();
    }

    if (name !== undefined) profile.name = name;
    if (bio !== undefined) profile.bio = bio;
    if (city !== undefined) profile.city = city;
    if (profileType !== undefined) profile.profileType = profileType;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (theme !== undefined) profile.theme = theme;
    if (category !== undefined) profile.category = category;
    if (subCategory !== undefined) profile.subCategory = subCategory;
    if (businessDetails !== undefined) {
      profile.businessDetails = {
        ...((profile.businessDetails && profile.businessDetails.toObject) ? profile.businessDetails.toObject() : profile.businessDetails || {}),
        ...businessDetails,
      };
    }
    if (req.body.photoUrl !== undefined) profile.photoUrl = req.body.photoUrl;
    if (req.body.verifiedBadge !== undefined) profile.verifiedBadge = req.body.verifiedBadge;
    if (contactDetails !== undefined) {
      profile.contactDetails = {
        ...profile.contactDetails.toObject(),
        ...contactDetails,
      };
    }

    // Recalculate completion
    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Profile Photo
 * POST /api/v1/profiles/me/photo
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded',
      });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const relativePath = `/uploads/photos/${req.file.filename}`;
    profile.photoUrl = `${config.publicUrl}${relativePath}`;
    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: profile.photoUrl,
        completionPercentage: profile.completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Profile
 * POST /api/v1/profiles/me/publish
 */
const publishProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Must have at least 40% completion to publish
    if (profile.completionPercentage < 40) {
      return res.status(400).json({
        success: false,
        message: `Profile completion is ${profile.completionPercentage}%. Please complete at least 40% (name, bio, photo) to publish.`,
      });
    }

    profile.status = 'published';

    // Generate QR Code if not present
    if (!profile.qrCodeUrl) {
      const profileWebUrl = `${config.frontendUrl}/p/${profile.username}`;
      const qrDataUrl = await generateQRCodeDataURL(profileWebUrl);
      profile.qrCodeUrl = qrDataUrl;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile published successfully! Your profile is now public.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check username availability
 * GET /api/v1/profiles/check-username/:username
 */
const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

        const clean = username.toLowerCase().trim();

    if (RESERVED_USERNAMES.includes(clean)) {
      return res.status(200).json({
        success: true,
        data: {
          username: clean,
          available: false,
          reason: 'reserved',
        },
      });
    }

    if (clean.length < 3 || clean.length > 30 || !/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(clean)) {
      return res.status(200).json({
        success: true,
        data: {
          username: clean,
          available: false,
          reason: 'invalid_format',
        },
      });
    }
    const existing = await Profile.findOne({ username: clean });

    res.status(200).json({
      success: true,
      data: {
        username: clean,
        available: !existing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Public Profile by username slug
 * GET /api/v1/profiles/:username
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({
      username: username.toLowerCase().trim(),
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or is currently private/draft',
      });
    }

    // Public sections only
    const sections = await Section.find({
      profileId: profile._id,
      visibility: 'public',
    }).sort({ order: 1 });

    // Active public reels only
    const reels = await Reel.find({
      profileId: profile._id,
      status: 'active',
      visibility: 'public',
    }).sort({ isPinned: -1, createdAt: -1 });

    // Sanitize contact details based on show* flags
    const sanitizedContact = {
      phone: profile.contactDetails?.showPhone ? profile.contactDetails.phone : undefined,
      whatsapp: profile.contactDetails?.showWhatsapp ? profile.contactDetails.whatsapp : undefined,
      email: profile.contactDetails?.showEmail ? profile.contactDetails.email : undefined,
    };

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: profile._id,
          name: profile.name,
          username: profile.username,
          photoUrl: profile.photoUrl,
          profileType: profile.profileType,
          bio: profile.bio,
          city: profile.city,
          theme: profile.theme || 'default',
          socialLinks: profile.socialLinks,
          qrCodeUrl: profile.qrCodeUrl,
          contactDetails: sanitizedContact,
          followersCount: profile.followersCount || 0,
          followingCount: profile.followingCount || 0,
          category: profile.category || 'IT & Software',
          subCategory: profile.subCategory || '',
          businessDetails: profile.businessDetails || {},
          verifiedBadge: profile.verifiedBadge || 'verified_pro',
          isVerifiedBadge: profile.isVerifiedBadge !== false,
          completionPercentage: profile.completionPercentage || 0,
          updatedAt: profile.updatedAt,
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
 * Get QR code for profile
 * GET /api/v1/profiles/:username/qr
 */
const getProfileQR = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({ username: username.toLowerCase() });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profileWebUrl = `${config.frontendUrl}/p/${profile.username}`;
    const qrDataUrl = await generateQRCodeDataURL(profileWebUrl);

    res.status(200).json({
      success: true,
      data: {
        username: profile.username,
        profileUrl: profileWebUrl,
        qrCode: qrDataUrl,
        qrCodeDataUrl: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Profile vCard (.vcf)
 * GET /api/v1/profiles/:username/vcard
 */
const getVCard = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({
      username: username.toLowerCase().trim(),
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or is currently private/draft',
      });
    }

    const profileWebUrl = `${config.frontendUrl}/p/${profile.username}`;
    const vcardText = generateVCard(profile, profileWebUrl);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${profile.username}.vcf"`);
    res.status(200).send(vcardText);
  } catch (error) {
    next(error);
  }
};

/**
 * Track Profile View
 * POST /api/v1/profiles/:username/view
 */
const trackProfileView = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await Profile.findOne({
      username: username.toLowerCase().trim(),
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    profile.analytics = profile.analytics || { totalViews: 0, totalClicks: 0, dailyViews: [], linkClicks: [] };
    profile.analytics.totalViews = (profile.analytics.totalViews || 0) + 1;

    let dayRecord = profile.analytics.dailyViews.find((d) => d.date === today);
    if (dayRecord) {
      dayRecord.views += 1;
    } else {
      profile.analytics.dailyViews.push({ date: today, views: 1 });
      if (profile.analytics.dailyViews.length > 30) {
        profile.analytics.dailyViews.shift();
      }
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        totalViews: profile.analytics.totalViews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track Link Click
 * POST /api/v1/profiles/:username/click
 */
const trackLinkClick = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { label, url } = req.body;
    const profile = await Profile.findOne({
      username: username.toLowerCase().trim(),
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.analytics = profile.analytics || { totalViews: 0, totalClicks: 0, dailyViews: [], linkClicks: [] };
    profile.analytics.totalClicks = (profile.analytics.totalClicks || 0) + 1;

    const linkUrl = url || '';
    const linkLabel = label || linkUrl || 'External Link';

    let linkItem = profile.analytics.linkClicks.find((l) => l.url === linkUrl);
    if (linkItem) {
      linkItem.count += 1;
    } else {
      profile.analytics.linkClicks.push({ label: linkLabel, url: linkUrl, count: 1 });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        totalClicks: profile.analytics.totalClicks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Creator Profile Analytics
 * GET /api/v1/profiles/me/analytics
 */
const getProfileAnalytics = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const today = new Date();
    const last7Days = [];
    const dailyMap = new Map();
    (profile.analytics?.dailyViews || []).forEach((d) => dailyMap.set(d.date, d.views));

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      last7Days.push({
        date: dateKey,
        views: dailyMap.get(dateKey) || 0,
        count: dailyMap.get(dateKey) || 0,
      });
    }

    const topLinks = (profile.analytics?.linkClicks || [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalViews: profile.analytics?.totalViews || 0,
        totalClicks: profile.analytics?.totalClicks || 0,
        recentViews: last7Days,
        dailyViews: last7Days,
        topLinks,
        linkClicks: profile.analytics?.linkClicks || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Visitor Inquiry
 * POST /api/v1/profiles/:username/inquiries
 */
const createInquiry = async (req, res, next) => {
  try {
    const { username } = req.params;
    const senderName = req.body.senderName || req.body.name;
    const senderEmail = req.body.senderEmail || req.body.email;
    const senderPhone = req.body.senderPhone || req.body.phone || '';
    const subject = req.body.subject || 'General Inquiry';
    const message = req.body.message;

    if (!senderName || !senderEmail || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message content are required',
      });
    }

    const profile = await Profile.findOne({
      username: username.toLowerCase().trim(),
      status: 'published',
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or is currently private/draft',
      });
    }

    const inquiry = await Inquiry.create({
      profileId: profile._id,
      senderName,
      senderEmail,
      senderPhone: senderPhone || '',
      subject: subject || 'General Inquiry',
      message,
    });

    // Trigger notification to creator
    try {
      await createNotificationHelper({
        recipientUserId: profile.userId,
        actorProfileId: null,
        type: 'inquiry',
        title: 'New Proposal Received 💼',
        message: `${senderName} submitted a "${subject || 'General Proposal'}" proposal`,
        entityId: inquiry._id,
        entityType: 'Inquiry',
        metadata: { senderEmail, senderName, subject },
      });
    } catch (notifErr) {
      console.error('Notification inquiry error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent to the creator successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Creator Inquiries
 * GET /api/v1/profiles/me/inquiries
 */
const getMyInquiries = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { status } = req.query;
    const query = { profileId: profile._id };
    if (status && ['unread', 'read', 'replied', 'archived'].includes(status)) {
      query.status = status;
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    const unreadCount = await Inquiry.countDocuments({ profileId: profile._id, status: 'unread' });

    res.status(200).json({
      success: true,
      data: {
        inquiries,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Inquiry Status
 * PUT /api/v1/profiles/me/inquiries/:id/status
 */
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['unread', 'read', 'replied', 'archived', 'new', 'contacted', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required',
      });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: id, profileId: profile._id },
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to Inquiry
 * POST /api/v1/profiles/me/inquiries/:id/reply
 * Body: { message }
 */
const replyToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const inquiry = await Inquiry.findOne({ _id: id, profileId: profile._id });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (!Array.isArray(inquiry.replies)) {
      inquiry.replies = [];
    }

    inquiry.replies.push({
      senderRole: 'creator',
      message: message.trim(),
      createdAt: new Date(),
    });
    inquiry.status = 'replied';
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow / Unfollow Creator
 * POST /api/v1/profiles/:username/follow
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { username } = req.params;

    const targetProfile = await Profile.findOne({ username: username.toLowerCase() });
    if (!targetProfile) {
      return res.status(404).json({ success: false, message: 'Target profile not found' });
    }

    // Prevent self-follow
    if (targetProfile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    let userProfile = await Profile.findOne({ userId: req.user._id });
    if (!userProfile) {
      userProfile = await Profile.create({
        userId: req.user._id,
        name: req.user.mobile,
        username: `user_${req.user.mobile.slice(-4)}`,
      });
    }

    const existingFollow = await Follow.findOne({
      followerId: req.user._id,
      followingId: targetProfile.userId,
    });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });

      targetProfile.followersCount = Math.max(0, (targetProfile.followersCount || 1) - 1);
      await targetProfile.save();

      userProfile.followingCount = Math.max(0, (userProfile.followingCount || 1) - 1);
      await userProfile.save();

      return res.status(200).json({
        success: true,
        message: `Unfollowed @${targetProfile.username}`,
        data: {
          isFollowing: false,
          followersCount: targetProfile.followersCount,
        },
      });
    } else {
      // Follow
      await Follow.create({
        followerId: req.user._id,
        followerProfileId: userProfile._id,
        followingId: targetProfile.userId,
        followingProfileId: targetProfile._id,
      });

      targetProfile.followersCount = (targetProfile.followersCount || 0) + 1;
      await targetProfile.save();

      userProfile.followingCount = (userProfile.followingCount || 0) + 1;
      await userProfile.save();

      // Trigger notification to followed creator
      try {
        await createNotificationHelper({
          recipientUserId: targetProfile.userId,
          actorProfileId: userProfile._id,
          type: 'follow',
          title: 'New Follower 👥',
          message: `@${userProfile.username} started following your profile`,
          entityId: targetProfile._id,
          entityType: 'Profile',
        });
      } catch (notifErr) {
        console.error('Notification follow error:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `Now following @${targetProfile.username}`,
        data: {
          isFollowing: true,
          followersCount: targetProfile.followersCount,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Follow Status for a creator
 * GET /api/v1/profiles/:username/follow-status
 */
const getFollowStatus = async (req, res, next) => {
  try {
    const { username } = req.params;
    const targetProfile = await Profile.findOne({ username: username.toLowerCase() });
    if (!targetProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    let isFollowing = false;
    if (req.user) {
      const exists = await Follow.exists({
        followerId: req.user._id,
        followingId: targetProfile.userId,
      });
      isFollowing = !!exists;
    }

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        followersCount: targetProfile.followersCount || 0,
        followingCount: targetProfile.followingCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Followers of a creator
 * GET /api/v1/profiles/:username/followers
 */
const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const targetProfile = await Profile.findOne({ username: username.toLowerCase() });
    if (!targetProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const follows = await Follow.find({ followingProfileId: targetProfile._id })
      .populate('followerProfileId', 'name username photoUrl profileType city')
      .limit(50);

    const followers = follows.map((f) => f.followerProfileId).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        followers,
        total: followers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vouch for a Creator Skill
 * POST /api/v1/profiles/:username/skills/vouch
 * Body: { skillName }
 */
const vouchSkill = async (req, res, next) => {
  try {
    const { username } = req.params;
    const rawSkill = req.body.skillName || req.body.skill;

    if (!rawSkill || !rawSkill.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const cleanSkill = rawSkill.trim();
    const profile = await Profile.findOne({ username: username.toLowerCase().trim() });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Find section with type 'skills' or auto-create if not yet created
    let skillSection = await Section.findOne({ profileId: profile._id, type: 'skills' });
    if (!skillSection) {
      skillSection = new Section({
        profileId: profile._id,
        type: 'skills',
        title: 'Skills & Expertise',
        visibility: 'public',
        order: 1,
        content: { items: [] },
      });
    }

    const currentItems = Array.isArray(skillSection.content?.items) ? skillSection.content.items : [];
    let found = false;
    let newVouches = 1;

    const updatedItems = currentItems.map((item) => {
      if (typeof item === 'string' && item.toLowerCase() === cleanSkill.toLowerCase()) {
        found = true;
        newVouches = 1;
        return { name: item, vouches: 1 };
      } else if (
        typeof item === 'object' &&
        item !== null &&
        (item.name || item.title || '').toLowerCase() === cleanSkill.toLowerCase()
      ) {
        found = true;
        const count = (item.vouches || 0) + 1;
        newVouches = count;
        return { ...item, name: item.name || item.title, vouches: count };
      }
      return item;
    });

    if (!found) {
      updatedItems.push({ name: cleanSkill, vouches: 1 });
      newVouches = 1;
    }

    skillSection.content = { ...skillSection.content, items: updatedItems };
    skillSection.markModified('content');
    await skillSection.save();

    // Trigger notification to creator if caller is logged in and not the creator
    if (req.user && profile.userId.toString() !== req.user._id.toString()) {
      try {
        const actorProfile = await Profile.findOne({ userId: req.user._id });
        await createNotificationHelper({
          recipientUserId: profile.userId,
          actorProfileId: actorProfile?._id,
          type: 'vouch',
          title: 'Skill Endorsed ⭐',
          message: `@${actorProfile?.username || 'A visitor'} vouched for your "${cleanSkill}" skill`,
          entityId: skillSection._id,
          entityType: 'Section',
        });
      } catch (notifErr) {
        console.error('Notification vouch error:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Vouched for ${cleanSkill}! ⭐`,
      data: {
        skillName: cleanSkill,
        vouches: newVouches,
        items: updatedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Delete / Deactivate User Account & Associated Profile Data
 * DELETE /api/v1/profiles/me/account
 */
const deleteMyAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });

    if (profile) {
      const userReels = await Reel.find({ profileId: profile._id }).select('_id');
      const reelIds = userReels.map((r) => r._id);

      await Section.deleteMany({ profileId: profile._id });
      await Reel.deleteMany({ profileId: profile._id });
      await Inquiry.deleteMany({ profileId: profile._id });
      const ProfileLookup = require('../models/ProfileLookup');
      const Report = require('../models/Report');
      await ProfileLookup.deleteMany({ profileId: profile._id });
      await Report.deleteMany({
        $or: [
          { targetId: profile._id },
          { targetId: { $in: reelIds } },
          { reporterId: userId },
        ],
      });
      await Profile.findByIdAndDelete(profile._id);
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { accountStatus: 'deactivated' });

    res.status(200).json({
      success: true,
      message: 'Account deactivated and profile data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadPhoto,
  publishProfile,
  checkUsername,
  getPublicProfile,
  getProfileQR,
  getVCard,
  trackProfileView,
  trackLinkClick,
  getProfileAnalytics,
  createInquiry,
  getMyInquiries,
  updateInquiryStatus,
  replyToInquiry,
  toggleFollow,
  getFollowStatus,
  getFollowers,
  vouchSkill,
  deleteMyAccount,
};
