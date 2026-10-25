const Reel = require('../models/Reel');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Bookmark = require('../models/Bookmark');
const { createNotificationHelper } = require('./notificationController');
const config = require('../config/env');
const { normalizeMediaUrl } = require('../utils/url');

/**
 * Instagram-Style Discovery & Algorithmic Ranking for Reels
 * Factors:
 * 1. Freshness / Discovery Boost (new reels < 24-48h get boosted to the front row for platform-wide exposure)
 * 2. Real Engagement Velocity (Likes, Comments, Shares, Bookmarks, Views)
 * 3. Gravity Time Decay (ensures older posts don't permanently crowd out fresh creator uploads)
 * 4. Pinned Reel Weight
 */
const calculateReelScore = (reel) => {
  const now = Date.now();
  const createdAt = new Date(reel.createdAt || now).getTime();
  const ageHours = Math.max(0, (now - createdAt) / (1000 * 60 * 60));

  // 1. Freshness Boost
  let freshnessBoost = 0;
  if (ageHours < 6) {
    freshnessBoost = 1000; // Ultra-fresh (guaranteed front row for newly posted reels)
  } else if (ageHours < 24) {
    freshnessBoost = 600;  // Fresh today
  } else if (ageHours < 72) {
    freshnessBoost = 250;  // Fresh this week
  }

  // 2. Engagement Points
  const likes = reel.likesCount || 0;
  const comments = reel.commentsCount || 0;
  const shares = reel.sharesCount || 0;
  const bookmarks = reel.bookmarksCount || 0;
  const views = reel.viewsCount || 0;

  const engagementPoints = (likes * 4) + (comments * 6) + (shares * 8) + (bookmarks * 5) + (views * 0.1);

  // 3. Gravity Time Decay (Instagram / HackerNews engagement decay curve)
  const gravity = 1.15;
  const decayedEngagement = (engagementPoints + 20) / Math.pow(ageHours + 2, gravity);

  // 4. Moderate Pin weight
  const pinBoost = reel.isPinned ? 120 : 0;

  return freshnessBoost + decayedEngagement + pinBoost;
};

/**
 * Get Public Reels Feed with Instagram Discovery Algorithm
 * GET /api/v1/reels/feed?page=1&limit=20
 */
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;
    const { tag, search } = req.query;

    const query = {
      status: 'active',
      visibility: 'public',
    };

    if (tag && tag.toLowerCase() !== 'all') {
      query.caption = { $regex: tag.replace('#', ''), $options: 'i' };
    }

    if (search && search.trim()) {
      query.caption = { $regex: search.trim(), $options: 'i' };
    }

    // Retrieve active public candidate reels
    const allCandidates = await Reel.find(query)
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType city verifiedBadge isVerifiedBadge',
      });

    const total = allCandidates.length;

    // Apply Instagram Discovery & Ranking Algorithm
    const scoredReels = allCandidates
      .map((r) => {
        const obj = r.toObject ? r.toObject() : { ...r };
        obj.videoUrl = normalizeMediaUrl(obj.videoUrl, obj.mediaType || 'video');
        obj.mediaUrl = normalizeMediaUrl(obj.mediaUrl || obj.videoUrl, obj.mediaType || 'video');
        obj.thumbnailUrl = normalizeMediaUrl(obj.thumbnailUrl, 'thumbnail');
        obj.algorithmicScore = calculateReelScore(obj);
        return obj;
      })
      .sort((a, b) => {
        if (b.algorithmicScore !== a.algorithmicScore) {
          return b.algorithmicScore - a.algorithmicScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    const paginatedReels = scoredReels.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        reels: paginatedReels,
        algorithm: 'instagram_discovery_v2',
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Reel
 * POST /api/v1/reels
 * Multipart: video file or videoUrl, caption, durationSeconds, visibility
 */
const createReel = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile && req.user.mobile) {
      profile = await Profile.findOne({ 'contactDetails.phone': req.user.mobile });
    }
    if (!profile) {
      // Auto-create profile record for the authenticated user so they are never blocked
      const userMobile = req.user.mobile || '';
      const fallbackName = req.user.name || 'Creator';
      const cleanSlug = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 12);
      profile = new Profile({
        userId: req.user._id,
        name: fallbackName,
        username: `${cleanSlug}_${Math.random().toString(36).substring(2, 6)}`,
        bio: 'Digital Creator on MyProfile',
        profileType: 'Creator',
        status: 'published',
        contactDetails: {
          phone: userMobile,
          showPhone: true,
        },
      });
      await profile.save();
    }

    let mediaType = req.body.mediaType || 'video';
    let videoUrl = req.body.videoUrl || req.body.mediaUrl || '';
    if (req.file) {
      videoUrl = `${config.publicUrl}/uploads/reels/${req.file.filename}`;
      if (req.file.mimetype && req.file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      }
    }

    // Auto-detect image URLs if mediaType is not specified
    if (
      mediaType === 'image' ||
      videoUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)($|\?)/i) ||
      (req.body.imageUrl && !req.body.videoUrl)
    ) {
      mediaType = 'image';
      videoUrl = videoUrl || req.body.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080';
    }

    // Default video clip fallback if user only provided caption
    if (mediaType === 'video' && (!videoUrl || !videoUrl.trim())) {
      videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
    }

    const {
      caption = '',
      durationSeconds = 15,
      visibility = 'public',
      thumbnailUrl = '',
      audioTitle,
      audioArtist,
      audioTrack,
    } = req.body;

    videoUrl = normalizeMediaUrl(videoUrl, mediaType);

    // Validate duration limit
    let duration = parseFloat(durationSeconds);
    if (!isNaN(duration) && duration > 60) {
      return res.status(400).json({
        success: false,
        message: 'Reel duration cannot exceed 60 seconds',
      });
    }
    if (isNaN(duration) || duration <= 0) {
      duration = 15;
    }

    // Sanitize thumbnail: ensure it is a valid image, NOT an .mp4 or empty
    let resolvedThumbnail = (thumbnailUrl && typeof thumbnailUrl === 'string') ? thumbnailUrl.trim() : '';
    if (mediaType === 'image') {
      resolvedThumbnail = normalizeMediaUrl(videoUrl, 'image');
    } else if (
      !resolvedThumbnail ||
      resolvedThumbnail.toLowerCase().endsWith('.mp4') ||
      resolvedThumbnail.toLowerCase().endsWith('.mov') ||
      resolvedThumbnail.toLowerCase().endsWith('.webm')
    ) {
      resolvedThumbnail = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
    }

    const resolvedAudioTitle =
      (audioTrack && typeof audioTrack === 'object' && audioTrack.title) ||
      audioTitle;
    const resolvedAudioArtist =
      (audioTrack && typeof audioTrack === 'object' && audioTrack.artist) ||
      audioArtist;

    const reel = new Reel({
      profileId: profile._id,
      mediaType,
      mediaUrl: videoUrl.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl: normalizeMediaUrl(resolvedThumbnail, 'thumbnail'),
      caption: caption.trim() || (mediaType === 'image' ? 'My showcase post 📸' : 'My showcase reel 🚀'),
      durationSeconds: Math.round(duration),
      visibility: visibility || 'public',
      status: 'active',
      audioTrack: {
        title: resolvedAudioTitle && resolvedAudioTitle.trim() ? resolvedAudioTitle.trim() : 'Original Sound',
        artist: resolvedAudioArtist && resolvedAudioArtist.trim() ? resolvedAudioArtist.trim() : profile.name || 'Creator',
      },
    });

    await reel.save();
    await reel.populate({
      path: 'profileId',
      select: 'name username photoUrl profileType city verifiedBadge isVerifiedBadge',
    });

    res.status(201).json({
      success: true,
      message: 'Reel posted successfully',
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reel by ID
 * GET /api/v1/reels/:id
 */
const getReelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id).populate({
      path: 'profileId',
      select: 'name username photoUrl profileType',
    });

    if (!reel || reel.status === 'taken_down') {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    res.status(200).json({
      success: true,
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record Reel View
 * POST /api/v1/reels/:id/view
 */
const recordView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    res.status(200).json({
      success: true,
      data: { viewsCount: reel.viewsCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like a Reel
 * POST /api/v1/reels/:id/like
 */
const likeReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    // Trigger notification if authenticated user liked another creator's reel
    if (req.user) {
      try {
        const targetProfile = await Profile.findById(reel.profileId);
        if (targetProfile && targetProfile.userId && targetProfile.userId.toString() !== req.user._id.toString()) {
          const actorProfile = await Profile.findOne({ userId: req.user._id });
          await createNotificationHelper({
            recipientUserId: targetProfile.userId,
            actorProfileId: actorProfile?._id,
            type: 'like',
            title: 'New Reel Like ❤️',
            message: `@${actorProfile?.username || 'A creator'} liked your video reel`,
            entityId: reel._id,
            entityType: 'Reel',
          });
        }
      } catch (notifErr) {
        console.error('Notification like error:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { likesCount: reel.likesCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track Share & Get Shareable Link
 * POST /api/v1/reels/:id/share
 */
const shareReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndUpdate(
      id,
      { $inc: { sharesCount: 1 } },
      { new: true }
    ).populate({
      path: 'profileId',
      select: 'name username photoUrl profileType',
    });

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const shareUrl = `https://myprofile-official-web.vercel.app/r/${reel._id}`;
    res.status(200).json({
      success: true,
      message: 'Reel shared successfully',
      data: {
        sharesCount: reel.sharesCount || 1,
        shareUrl,
        reelId: reel._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Reel
 * DELETE /api/v1/reels/:id
 */
const deleteReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findOne({ userId: req.user._id });

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    // Check ownership or admin
    const isOwner = profile && reel.profileId.toString() === profile._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this reel' });
    }

    await Reel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Reel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reels from Followed Creators
 * GET /api/v1/reels/feed/following?page=1&limit=10
 */
const getFollowingFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const skip = (page - 1) * limit;

    // Find all creators this user follows
    const follows = await Follow.find({ followerId: req.user._id }).select('followingProfileId');
    const followingProfileIds = follows.map((f) => f.followingProfileId);

    const query = {
      profileId: { $in: followingProfileIds },
      status: 'active',
      visibility: 'public',
    };

    const reels = await Reel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType city followersCount verifiedBadge isVerifiedBadge',
      });

    const total = await Reel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reels,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Comment to a Reel
 * POST /api/v1/reels/:id/comments
 * Body: { text }
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({
        userId: req.user._id,
        name: req.user.mobile,
        username: `user_${req.user.mobile.slice(-4)}`,
      });
    }

    const comment = await Comment.create({
      reelId: reel._id,
      userId: req.user._id,
      profileId: profile._id,
      text: text.trim(),
    });

    // Increment reel comments count
    reel.commentsCount = (reel.commentsCount || 0) + 1;
    await reel.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'profileId',
      'name username photoUrl'
    );

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Comments for a Reel
 * GET /api/v1/reels/:id/comments
 */
const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ reelId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('profileId', 'name username photoUrl');

    res.status(200).json({
      success: true,
      data: {
        comments,
        commentsCount: comments.length,
        total: comments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Comment
 * DELETE /api/v1/reels/:id/comments/:commentId
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reel = await Reel.findById(id);
    const profile = await Profile.findOne({ userId: req.user._id });

    // Allowed if requester is comment author, reel owner, or admin
    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isReelOwner = reel && profile && reel.profileId.toString() === profile._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isReelOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);

    let updatedCount = 0;
    if (reel && reel.commentsCount > 0) {
      reel.commentsCount -= 1;
      await reel.save();
      updatedCount = reel.commentsCount;
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        commentsCount: updatedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Bookmark on a Reel
 * POST /api/v1/reels/:id/bookmark
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);
    if (!reel || reel.status === 'taken_down') {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const existing = await Bookmark.findOne({ userId: req.user._id, reelId: id });
    let isBookmarked = false;

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      reel.bookmarksCount = Math.max(0, (reel.bookmarksCount || 1) - 1);
      await reel.save();
      isBookmarked = false;
    } else {
      await Bookmark.create({ userId: req.user._id, reelId: id });
      reel.bookmarksCount = (reel.bookmarksCount || 0) + 1;
      await reel.save();
      isBookmarked = true;

      // Trigger notification to reel owner
      try {
        const targetProfile = await Profile.findById(reel.profileId);
        if (targetProfile && targetProfile.userId && targetProfile.userId.toString() !== req.user._id.toString()) {
          const actorProfile = await Profile.findOne({ userId: req.user._id });
          await createNotificationHelper({
            recipientUserId: targetProfile.userId,
            actorProfileId: actorProfile?._id,
            type: 'bookmark',
            title: 'Reel Saved 🔖',
            message: `@${actorProfile?.username || 'A creator'} saved your video reel to their vault`,
            entityId: reel._id,
            entityType: 'Reel',
          });
        }
      } catch (notifErr) {
        console.error('Notification bookmark error:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Reel saved to bookmarks vault' : 'Reel removed from bookmarks',
      data: {
        isBookmarked,
        bookmarksCount: reel.bookmarksCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Saved / Bookmarked Reels
 * GET /api/v1/reels/feed/saved?page=1&limit=20
 */
const getSavedReels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'reelId',
        match: { status: 'active', visibility: 'public' },
        populate: {
          path: 'profileId',
          select: 'name username photoUrl profileType city verifiedBadge isVerifiedBadge',
        },
      });

    const reels = bookmarks
      .filter((b) => b.reelId)
      .map((b) => ({
        ...b.reelId.toObject(),
        isBookmarked: true,
        bookmarkedAt: b.createdAt,
      }));

    const total = await Bookmark.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        reels,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Pin Reel to Profile Showcase
 * POST /api/v1/reels/:id/pin
 */
const togglePinReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile required' });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const isOwner = reel.profileId.toString() === profile._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to pin this reel' });
    }

    const willBePinned = !reel.isPinned;
    if (willBePinned) {
      // Unpin any previously pinned reels for this creator
      await Reel.updateMany(
        { profileId: profile._id, isPinned: true },
        { $set: { isPinned: false } }
      );
      reel.isPinned = true;
    } else {
      reel.isPinned = false;
    }

    await reel.save();

    res.status(200).json({
      success: true,
      message: willBePinned ? 'Reel pinned as Master Pitch 📌' : 'Reel unpinned',
      data: {
        isPinned: reel.isPinned,
        reel,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get My Reels (Authenticated creator)
 * GET /api/v1/reels/my-reels
 */
const getMyReels = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          reels: [],
          total: 0,
        },
      });
    }

    const reels = await Reel.find({
      profileId: profile._id,
      status: { $ne: 'taken_down' },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType',
      });

    res.status(200).json({
      success: true,
      data: {
        reels,
        total: reels.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Reel Visibility
 * PUT /api/v1/reels/:id/visibility
 */
const updateReelVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    const validVisibilities = ['public', 'profile-only', 'private'];
    if (!visibility || !validVisibilities.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: `Invalid visibility. Must be one of: ${validVisibilities.join(', ')}`,
      });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const isOwner = profile && reel.profileId.toString() === profile._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this reel visibility',
      });
    }

    reel.visibility = visibility;
    await reel.save();
    await reel.populate({
      path: 'profileId',
      select: 'name username photoUrl profileType',
    });

    res.status(200).json({
      success: true,
      message: 'Reel visibility updated successfully',
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeed,
  getFollowingFeed,
  getSavedReels,
  toggleBookmark,
  togglePinReel,
  createReel,
  getReelById,
  recordView,
  likeReel,
  shareReel,
  deleteReel,
  addComment,
  getComments,
  deleteComment,
  getMyReels,
  updateReelVisibility,
};

