const Reel = require('../models/Reel');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Bookmark = require('../models/Bookmark');
const { createNotificationHelper } = require('./notificationController');
const config = require('../config/env');

/**
 * Get Public Reels Feed
 * GET /api/v1/reels/feed?page=1&limit=10
 */
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
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

    const reels = await Reel.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType city verifiedBadge isVerifiedBadge',
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
 * Create a Reel
 * POST /api/v1/reels
 * Multipart: video file or videoUrl, caption, durationSeconds, visibility
 */
const createReel = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile required to post reels' });
    }

    let videoUrl = req.body.videoUrl;
    if (req.file) {
      videoUrl = `${config.publicUrl}/uploads/reels/${req.file.filename}`;
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video file or videoUrl is required',
      });
    }

    const {
      caption = '',
      durationSeconds = 15,
      visibility = 'public',
      thumbnailUrl = '',
      audioTitle,
      audioArtist,
    } = req.body;

    const duration = parseFloat(durationSeconds);
    if (isNaN(duration) || duration > 60 || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reel duration must be a valid number between 1 and 60 seconds',
      });
    }

    const reel = new Reel({
      profileId: profile._id,
      videoUrl,
      thumbnailUrl,
      caption,
      durationSeconds: Math.round(duration),
      visibility,
      status: 'active',
      audioTrack: {
        title: audioTitle && audioTitle.trim() ? audioTitle.trim() : 'Original Sound',
        artist: audioArtist && audioArtist.trim() ? audioArtist.trim() : profile.name || 'Creator',
      },
    });

    await reel.save();

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
  deleteReel,
  addComment,
  getComments,
  deleteComment,
};

