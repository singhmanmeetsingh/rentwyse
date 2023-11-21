/**
 * Over here we have our app
 */

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { hashPassword } = require("./config/bcrypt-config");
const userRoutes = require("./routes/user");
const postsRoutes = require("./routes/posts");
const path = require("path");
const kycRoutes = require("./routes/kyc");
const messageRoutes = require("./routes/messages");
const conversationRoutes = require("./routes/conversations");
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Connect to MongoDB.
//  */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to the database...");
  })
  .catch(() => {
    console.log("connection failed.");
  });

//body-parser
app.use(bodyParser.json());

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

//allowing api call to our image folder
app.use("/images", express.static(path.join("images")));

// Setting up headers for CORES
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );

  next();
});

//passport and sessions (no longer needed has we would be using jwt)
//routes
app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

// Exporting this app file
module.exports = app;
