const User = require("../models/user");
const bcrypt = require("bcrypt");
const { hashPassword } = require("../config/bcrypt-config");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config({ path: ".env" });

exports.createUser = async (req, res, next) => {
  const { username, password, email, firstName, lastName, address, phone } =
    req.body;
  console.log("req", req.body);

  // Use the hashPassword function to securely hash the password
  hashPassword(password, async (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Registration failed" });
    }
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      address,
      phone,
    });

    await newUser
      .save()
      .then((result) => {
        res
          .status(201)
          .json({ message: "user created Successfully!", result: result });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid Authentication Credentials !!!!",
        });
      });
  });
};

exports.userLogin = async (req, res, next) => {
  let fetchedUser;
  await User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        throw new Error("User not found"); // <- throw an error if no user is found
      }
      fetchedUser = user;
      console.log("bcrypt compare " + req.body.password, user.password);
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      console.log(result);
      if (!result) {
        throw new Error("Password mismatch"); // <- throw an error if passwords don't match
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
      // One single response for any error, so no chance of multiple responses
      res.status(401).json({ message: "Invalid authentication credentials" });
    });
};
