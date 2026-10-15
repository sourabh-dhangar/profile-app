const Notification = require('../models/Notification');
const Profile = require('../models/Profile');

/**
 * Get Current User's Notifications
 * GET /api/v1/notifications?page=1&limit=20
 */
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actorProfileId', 'name username photoUrl verifiedBadge isVerifiedBadge'),
      Notification.countDocuments({ recipientId: req.user._id, read: false }),
      Notification.countDocuments({ recipientId: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
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
 * Mark Single Notification as Read
 * PATCH /api/v1/notifications/:id/read
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notification,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark All Notifications as Read
 * POST /api/v1/notifications/read-all
 */
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        unreadCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Safely create notification in backend workflows
 */
const createNotificationHelper = async ({
  recipientUserId,
  actorProfileId,
  type,
  title,
  message,
  entityId = null,
  entityType = null,
  metadata = {},
}) => {
  try {
    if (!recipientUserId) return null;
    return await Notification.create({
      recipientId: recipientUserId,
      actorProfileId: actorProfileId || null,
      type,
      title,
      message,
      entityId,
      entityType,
      metadata,
    });
  } catch (err) {
    console.error('Error creating notification helper:', err.message);
    return null;
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
  createNotificationHelper,
};
