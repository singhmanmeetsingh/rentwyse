const Conversation = require("../models/conversation");
const Message = require("../models/message");
exports.startOrGetConversation = async (req, res) => {
  try {
    const { userId } = req.userData; // Sender, authenticated user
    const { recipientId } = req.body; // Receiver

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      // Start a new conversation if it does not exist
      conversation = new Conversation({
        participants: [userId, recipientId],
      });
      await conversation.save();
    }

    res.status(200).json({
      message: "Conversation fetched successfully",
      conversationId: conversation._id,
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
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .exec();

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get messages', error: error.message });
  }
};

exports.getAllConversationsForUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("conversation hit");
      // Assuming that a 'Conversation' includes an array of participant IDs
      const conversations = await Conversation.find({ participants: userId })
        .populate("participants", "username") // Adjust the fields you want to include from the 'User' model
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
          read: false
        });
  
        // Combine conversation info with the last message and unread count
        conversationsWithUnread.push({
          ...conversation.toObject(),
          lastMessage,
          unreadCount // Including the unread messages count here
        });
      }
  
      res.status(200).json(conversationsWithUnread); // Send this modified array back
    } catch (error) {
      res.status(500).json({ message: "Fetching conversations failed." });
    }
  };
  
