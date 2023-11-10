const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: [{ type: String, required: true }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true }, // so we are doing this to keep track of who creates each post so we can then use to authorize changes to the post
  //Over here we are adding the ref: 'User' to create a Pk - Fk relationship btw the post and user schema
  city: { type: String },
  address: { type: String },
  province: { type: String },
  zipcode: { type: Number },
  country: { type: String },
  roomType: { type: String },
});

module.exports = mongoose.model("Post", postSchema);
