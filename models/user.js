const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);