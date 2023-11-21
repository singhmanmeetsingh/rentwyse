const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }]
  });

module.exports = mongoose.model("Conversation", conversationSchema);
