const express = require("express");
const router = express.Router();
const ConversationController = require("../controllers/conversationController");
const checkAuth = require("../middleware/check-auth");
const documentUpload = require("../middleware/documents");

// Route to start a new conversation or get an existing one
router.post("/start", checkAuth, ConversationController.startOrGetConversation);

// Route to get the messages of a conversation
router.get(
  "/:conversationId/messages",
  checkAuth,
  ConversationController.getConversationMessages
);

router.get("/user/:userId", ConversationController.getAllConversationsForUser);

router.post(
  "/:conversationId/setViewingDate",
  checkAuth,
  ConversationController.setViewingDate
);

//route to upload agreement documents 
router.post(
  "/:conversationId/upload-document",
  checkAuth,
  documentUpload,
  ConversationController.uploadAgreementDocument
);

module.exports = router;
