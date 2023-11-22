const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  viewingDate: { type: Date },
  agreementDocuments: [
    {
      type: String, // URL or path to the document
      required: false,
    },
  ],
  renegotiatedPrice: {
    type: Number,
    required: false,
  },
  agreementSigned: {
    type: Boolean,
    default: false,
  },
  signedAgreementDocuments: [
    {
      type: String, // URL or path to the signed document
      required: false,
    },
  ],
});

module.exports = mongoose.model("Conversation", conversationSchema);
