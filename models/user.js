const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// we would need the unique validator package if we are to run the unique verification

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true, // Ensure uniqueness of the 'username' field
    required: true, // Make 'username' a required field
  },
  password: {
    type: String,
    required: true, // Make 'password' a required field
  },
  email: {
    type: String,
    unique: true, // Ensure uniqueness of the 'email' field
    required: true, // Make 'email' a required field
  },
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
});

userSchema.plugin(uniqueValidator); // so this is how we run the check on the username and email to make sure its unique

module.exports = mongoose.model("User", userSchema);
