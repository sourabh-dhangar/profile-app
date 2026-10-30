const User = require('../models/User');
const Profile = require('../models/Profile');
const Reel = require('../models/Reel');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');

/**
 * File a report (accessible to authenticated users)
 * POST /api/v1/reports
 * Body: { targetType, targetId, reason }
 */
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'targetType, targetId, and reason are required',
      });
    }

    const report = new Report({
      targetType,
      targetId,
      reporterId: req.user ? req.user._id : undefined,
      reason,
    });
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will review it.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reports (Admin/Moderator only)
 * GET /api/v1/admin/reports
 */
const getReports = async (req, res, next) => {
  try {
    const { status, targetType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('reporterId', 'mobile role');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
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
 * Resolve/Action a report (Admin/Moderator)
 * PUT /api/v1/admin/reports/:id
 * Body: { status, actionTaken, adminNotes }
 */
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken, adminNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    // Apply moderation action if takedown requested
    if (actionTaken === 'takedown') {
      if (report.targetType === 'reel') {
        await Reel.findByIdAndUpdate(report.targetId, { status: 'taken_down' });
      } else if (report.targetType === 'profile') {
        await Profile.findByIdAndUpdate(report.targetId, { status: 'unpublished' });
      }
    }

    await report.save();

    // Audit log
    await AuditLog.create({
      adminId: req.user._id,
      action: `REPORT_ACTION_${actionTaken || status}`,
      targetType: 'report',
      targetId: report._id,
      details: { status, actionTaken, adminNotes },
    });

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Users (Admin only)
 * GET /api/v1/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, accountStatus } = req.query;
    const query = {};
    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(query)
      .select('-otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    const enrichedUsers = users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
    }));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
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
 * Update User Status (Admin only)
 * PUT /api/v1/admin/users/:id/status
 * Body: { accountStatus, role }
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (accountStatus === 'suspended') {
      if (user.mobile === '+919999999999' || user.mobile.endsWith('9999999999')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot suspend the root platform administrator account.',
        });
      }
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Administrators cannot suspend their own account.',
        });
      }
    }

    if (accountStatus) user.accountStatus = accountStatus;
    if (role) user.role = role;
    await user.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'UPDATE_USER_STATUS',
      targetType: 'user',
      targetId: user._id,
      details: { accountStatus, role },
    });

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Platform Analytics Summary (Admin only)
 * GET /api/v1/admin/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      suspendedUsers,
      totalProfiles,
      publishedProfiles,
      activeReels,
      suspendedReels,
      flaggedReels,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'suspended' }),
      Profile.countDocuments(),
      Profile.countDocuments({ status: 'published' }),
      Reel.countDocuments({ status: 'active' }),
      Reel.countDocuments({ status: 'taken_down' }),
      Reel.countDocuments({ status: 'flagged' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, suspended: suspendedUsers },
        profiles: { total: totalProfiles, published: publishedProfiles },
        reels: { total: activeReels + suspendedReels + flaggedReels, active: activeReels, suspended: suspendedReels, flagged: flaggedReels },
        reports: { pending: pendingReports },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all platform reels with creator details, status, views, and filter support (Admin/Moderator only)
 * GET /api/v1/admin/reels?page=1&limit=20&status=all&search=...
 */
const getAdminReels = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      const term = search.trim();
      const matchingProfiles = await Profile.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { username: { $regex: term, $options: 'i' } },
        ],
      }).select('_id');
      const profileIds = matchingProfiles.map((p) => p._id);

      query.$or = [
        { caption: { $regex: term, $options: 'i' } },
        { profileId: { $in: profileIds } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const reels = await Reel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate({
        path: 'profileId',
        select: 'name username photoUrl profileType category city userId',
        populate: {
          path: 'userId',
          select: 'mobile accountStatus role',
        },
      });

    const total = await Reel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reels,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate / suspend / restore reel status (Admin/Moderator only)
 * PUT /api/v1/admin/reels/:id/status
 * Body: { status, reason }
 */
const updateReelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'flagged', 'taken_down'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const reel = await Reel.findById(id).populate({
      path: 'profileId',
      select: 'name username',
    });

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const previousStatus = reel.status;
    reel.status = status;
    await reel.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: `MODERATE_REEL_${status.toUpperCase()}`,
      targetType: 'reel',
      targetId: reel._id,
      details: { previousStatus, newStatus: status, reason: reason || 'Admin moderation' },
    });

    res.status(200).json({
      success: true,
      message: `Reel status updated to ${status}`,
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin permanently delete reel (Admin only)
 * DELETE /api/v1/admin/reels/:id
 */
const deleteAdminReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    await Promise.all([
      Reel.findByIdAndDelete(id),
      Comment.deleteMany({ reelId: id }),
      Bookmark.deleteMany({ reelId: id }),
    ]);

    await AuditLog.create({
      adminId: req.user._id,
      action: 'ADMIN_DELETE_REEL',
      targetType: 'reel',
      targetId: id,
      details: { caption: reel.caption, profileId: reel.profileId },
    });

    res.status(200).json({
      success: true,
      message: 'Reel deleted permanently by administrator',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
  getUsers,
  updateUserStatus,
  getAnalytics,
  getAdminReels,
  updateReelStatus,
  deleteAdminReel,
};
