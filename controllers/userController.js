const { validationResult } = require("express-validator");
const User = require("../models/user");
const {hashPassword} = require("../config/bcrypt-config");

exports.postRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, password, email, firstName, lastName, address, phone } =
      req.body;
    console.log("req", req.body);
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    // Use the hashPassword function to securely hash the password
    hashPassword(password, async (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Registration failed" });
      }
      const newUser = new User({
        username,
        password : hashedPassword,
        email,
        firstName,
        lastName,
        address,
        phone,
      });

      await newUser.save();

      res.status(201).json({ message: "Registration successful" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};