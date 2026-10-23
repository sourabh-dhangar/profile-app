const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

/**
 * GET /api/v1/chat/conversations
 * Get all active direct chat conversations for current user
 */
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants.find(
          (p) => p.toString() !== currentUserId.toString()
        );

        const otherProfile = await Profile.findOne({ userId: otherUserId })
          .select('name username photoUrl profileType category subCategory status')
          .lean();

        const unreadCount =
          conv.unreadCounts && conv.unreadCounts[currentUserId.toString()]
            ? conv.unreadCounts[currentUserId.toString()]
            : 0;

        return {
          _id: conv._id,
          otherProfile: otherProfile || {
            name: 'User',
            username: 'user',
            photoUrl: '',
          },
          lastMessage: conv.lastMessage || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    // Filter out conversations where otherProfile is missing (e.g. deleted accounts)
    const validConversations = formatted.filter((c) => c.otherProfile);

    res.status(200).json({
      success: true,
      data: {
        conversations: validConversations,
      },
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations',
    });
  }
};

/**
 * GET /api/v1/chat/conversations/:username
 * Retrieve or start a conversation thread with a specific creator/user
 */
exports.getOrCreateConversationWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUsername = req.params.username.toLowerCase().trim();

    const targetProfile = await Profile.findOne({ username: targetUsername })
      .select('name username photoUrl profileType category subCategory userId bio')
      .lean();

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: `User @${targetUsername} not found`,
      });
    }

    if (targetProfile.userId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a direct chat with yourself',
      });
    }

    // Find existing conversation between these 2 users
    let conv = await Conversation.findOne({
      participants: { $all: [currentUserId, targetProfile.userId] },
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [currentUserId, targetProfile.userId],
        unreadCounts: {},
      });
    }

    // Fetch conversation messages
    const messages = await ChatMessage.find({
      conversationId: conv._id,
    })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    // Mark messages sent to current user as read
    await ChatMessage.updateMany(
      {
        conversationId: conv._id,
        recipientId: currentUserId,
        read: false,
      },
      { read: true }
    );

    // Reset unread counter for current user
    if (conv.unreadCounts && conv.unreadCounts.set) {
      conv.unreadCounts.set(currentUserId.toString(), 0);
      await conv.save();
    }

    res.status(200).json({
      success: true,
      data: {
        conversation: conv,
        targetProfile,
        messages,
      },
    });
  } catch (error) {
    console.error('getOrCreateConversationWithUser error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation',
    });
  }
};

/**
 * POST /api/v1/chat/conversations/:username/messages
 * Send a 1-on-1 direct message
 */
exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUsername = req.params.username.toLowerCase().trim();
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty',
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters',
      });
    }

    const targetProfile = await Profile.findOne({ username: targetUsername });
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: `User @${targetUsername} not found`,
      });
    }

    if (targetProfile.userId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
      });
    }

    let conv = await Conversation.findOne({
      participants: { $all: [currentUserId, targetProfile.userId] },
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [currentUserId, targetProfile.userId],
        unreadCounts: {},
      });
    }

    const newMsg = await ChatMessage.create({
      conversationId: conv._id,
      senderId: currentUserId,
      recipientId: targetProfile.userId,
      text: text.trim(),
    });

    // Update conversation last message
    conv.lastMessage = {
      text: text.trim(),
      senderId: currentUserId,
      createdAt: new Date(),
    };

    // Increment recipient unread count
    const recipientKey = targetProfile.userId.toString();
    const currentUnread = conv.unreadCounts ? conv.unreadCounts.get(recipientKey) || 0 : 0;
    conv.unreadCounts.set(recipientKey, currentUnread + 1);

    await conv.save();

    // Notify recipient in the background
    Profile.findOne({ userId: currentUserId }).then((senderProfile) => {
      Notification.create({
        recipientId: targetProfile.userId,
        actorProfileId: senderProfile?._id || null,
        type: 'chat',
        title: `Message from ${senderProfile?.name || 'Someone'}`,
        message: text.trim().slice(0, 100),
        metadata: {
          username: senderProfile?.username,
          conversationId: conv._id,
        },
      }).catch((notifErr) => console.log('Chat notification error:', notifErr.message));
    });

    res.status(201).json({
      success: true,
      data: newMsg,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

/**
 * GET /api/v1/chat/unread-count
 * Get total unread direct messages for current user
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
};

/**
 * GET /api/v1/chat/search-users?q=...
 * Search registered creators/users to start a new chat with
 */
exports.searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const query = (req.query.q || '').trim();

    const filter = {
      userId: { $ne: currentUserId },
      status: 'published',
    };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } },
      ];
    }

    const profiles = await Profile.find(filter)
      .select('name username photoUrl category subCategory profileType')
      .limit(15)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users: profiles,
      },
    });
  } catch (error) {
    console.error('searchUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
    });
  }
};
