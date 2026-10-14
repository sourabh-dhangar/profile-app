const Reel = require('../models/Reel');
const Profile = require('../models/Profile');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
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

    const reels = await Reel.find({
      status: 'active',
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType city',
      });

    const total = await Reel.countDocuments({
      status: 'active',
      visibility: 'public',
    });

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
        select: 'name username photoUrl profileType city followersCount',
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

module.exports = {
  getFeed,
  getFollowingFeed,
  createReel,
  getReelById,
  recordView,
  likeReel,
  deleteReel,
  addComment,
  getComments,
  deleteComment,
};
