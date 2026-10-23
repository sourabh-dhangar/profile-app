const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticate);

// List all direct conversations for current user
router.get('/conversations', chatController.getConversations);

// Unread count across all direct chats
router.get('/unread-count', chatController.getUnreadCount);

// Search creators to start a direct chat
router.get('/search-users', chatController.searchUsers);

// Get or initiate a conversation thread with a specific user
router.get('/conversations/:username', chatController.getOrCreateConversationWithUser);

// Send a message in a conversation with a specific user
router.post('/conversations/:username/messages', chatController.sendMessage);

module.exports = router;
