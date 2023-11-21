const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Post = require("../models/post")
exports.startOrGetConversation = async (req, res) => {
  try {
    const { userId } = req.userData; // Sender, authenticated user
    const { recipientId } = req.body; // Receiver
    const { postId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      // Start a new conversation if it does not exist
      console.log("no convo");
      conversation = new Conversation({
        participants: [userId, recipientId],
        postId: postId,
      });
      await conversation.save();
    }

    res.status(200).json({
      message: "Conversation fetched successfully",
      conversationId: conversation._id,
      postId: postId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get conversation" });
  }
};

exports.getConversationMessages = async (req, res) => {
  console.log("getConversationMessages hit");
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId: conversationId })
      .populate("sender", "username")
      .populate("receiver", "username")
      .exec();

    res.status(200).json({ messages });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get messages", error: error.message });
  }
};

exports.getAllConversationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("conversation hit");
    // Assuming that a 'Conversation' includes an array of participant IDs
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username") // Adjust the fields you want to include from the 'User' model
      .populate("postId")
      .exec();

    // Create an array to hold conversations with unread messages count
    const conversationsWithUnread = [];

    for (let conversation of conversations) {
      // Fetch the last message for each conversation
      const lastMessage = await Message.findOne({
        conversationId: conversation._id,
      })
        .sort({ createdAt: -1 })
        .populate("sender", "username")
        .populate("receiver", "username")
        .exec();

      // Count unread messages where the current user is the receiver
      const unreadCount = await Message.count({
        conversationId: conversation._id,
        receiver: userId,
        read: false,
      });

      // Combine conversation info with the last message and unread count
      conversationsWithUnread.push({
        ...conversation.toObject(),
        lastMessage,
        unreadCount, // Including the unread messages count here
        viewingDate: conversation.viewingDate ? conversation.viewingDate : null // Include viewingDate here
      });
    }

    res.status(200).json(conversationsWithUnread); // Send this modified array back
  } catch (error) {
    res.status(500).json({ message: "Fetching conversations failed." });
  }
};

exports.setViewingDate = async (req, res) => {
  const { viewingDate } = req.body;
  const conversationId = req.params.conversationId;
  console.log("setting a viewing date !!!");
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if the user is the creator of the post linked to the conversation
    const post = await Post.findById(conversation.postId);
    if (req.userData.userId !== post.creator.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to set the viewing date" });
    }

    // Ensure viewingDate is a valid date
    if (!viewingDate || isNaN(new Date(viewingDate).getTime())) {
      return res.status(400).json({ message: "Invalid viewing date" });
    }

    conversation.viewingDate = viewingDate;
    await conversation.save();

    res.status(200).json({
      message: "Viewing date set successfully",
      viewingDate: conversation.viewingDate,
      conversation: conversation
    });
  } catch (error) {
    console.error("Error in setViewingDate:", error);
    res
      .status(500)
      .json({ message: "Failed to set viewing date", error: error.toString() });
  }
};



//Document Upload
exports.uploadAgreementDocument = async (req, res) => {
  const conversationId = req.params.conversationId;
  const documentPath = req.file.path; // Path where the document is saved should be passed by multer middle ware on the route

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    

    conversation.agreementDocument = documentPath;
    await conversation.save();

    res.status(200).json({
      message: "Document uploaded successfully",
      documentPath: documentPath
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload document" });
  }
};