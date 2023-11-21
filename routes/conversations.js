const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');
const checkAuth = require('../middleware/check-auth');

// Route to start a new conversation or get an existing one
router.post('/start', checkAuth, ConversationController.startOrGetConversation);

// Route to get the messages of a conversation
router.get('/:conversationId/messages', checkAuth, ConversationController.getConversationMessages);

router.get('/user/:userId', ConversationController.getAllConversationsForUser);

module.exports = router;
