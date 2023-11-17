const User = require("../models/user");
const bcrypt = require("bcrypt");
const { hashPassword } = require("../config/bcrypt-config");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../Services/emailService");

dotenv.config({ path: ".env" });

exports.createUser = async (req, res, next) => {
  const {
    username,
    password,
    email,
    firstName,
    lastName,
    address,
    city,
    province,
    zipcode,
    country,
    phone,
  } = req.body;
  console.log("req", req.body);

  // Use the hashPassword function to securely hash the password
  hashPassword(password, async (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Registration failed" });
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      city,
      address,
      province,
      zipcode,
      country,
      phone,
      emailToken: verificationToken,
      isEmailVerified: false,
    });
    await newUser
      .save()
      .then((result) => {
        res
          .status(201)
          .json({ message: "user created Successfully!", result: result });
        emailService.sendVerificationEmail(newUser.email, verificationToken);
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid Authentication Credentials !!!!",
        });
      });
  });
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      // Token not found or invalid token
      return res.status(400).send("This link is invalid or has expired.");
    }

    if (user.isEmailVerified) {
      // User has already verified their email
      return res
        .status(400)
        .send("This email has already been verified. You can now login.");
    }

    // Set the email as verified
    user.emailToken = null;
    user.isEmailVerified = true;
    await user.save();

    // Optional: Send a confirmation email here using your emailService

    // Redirect the user to the login page or a confirmation page
    res.status(200).send("email verification succesfull");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "An error occurred during the verification process. Please try again later."
      );
  }
};

exports.getUserDetails = async (req, res, next) => {
  const userId = req.params.id;
  console.log("getUser hit...");
  try {
    const user = await User.findById(userId, "-password -emailToken"); // Exclude sensitive information
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "Fetching user failed", error: error });
  }
};

exports.updateUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
    city,
    address,
    zipcode,
    province,
    country,
    phone,
  } = req.body;
  const userId = req.params.id;
  console.log("update user");
  try {
    // Only update non-sensitive fields
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // the email cannot be updated without re-verification
    user.firstName = firstName;
    user.lastName = lastName;
    user.address = address;
    user.phone = phone;
    user.city = city;
    user.province = province;
    user.zipcode = zipcode;
    user.country = country;

    const result = await user.save();
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    res.status(500).json({ message: "Could not update user", error: error });
  }
};

exports.userLogin = async (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return Promise.reject(); // Prevent further execution
      }
      if (!user.isEmailVerified) {
        res.status(401).json({ message: "Auth failed: Email not verified" });
        return Promise.reject();
      }
      fetchedUser = user;
      console.log("bcrypt compare " + req.body.password, user.password);
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        res.status(401).json({ message: "Password mismatch" });
        return Promise.reject();
      }
      const token = jwt.sign(
        { username: fetchedUser.username, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
      });
    })
    .catch((err) => {
      if (!res.headersSent) {
        // This will be true only if no `.json()` was called before.
        // Send a generic error message if none of the specific errors were triggered.
        res.status(401).json({ message: "Invalid authentication credentials" });
      }
    });
};

exports.changePassword = async (req, res, next) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare current password with stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Could not change password", error: error });
  }
};
