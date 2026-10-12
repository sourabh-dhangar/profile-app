const User = require('../models/User');
const Profile = require('../models/Profile');
const Reel = require('../models/Reel');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

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
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
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
      totalProfiles,
      publishedProfiles,
      totalReels,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Profile.countDocuments({ status: 'published' }),
      Reel.countDocuments({ status: 'active' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers },
        profiles: { total: totalProfiles, published: publishedProfiles },
        reels: { total: totalReels },
        reports: { pending: pendingReports },
      },
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
};
