const express = require("express");
const router = express.Router();
const PostController = require("../controllers/PostsController");
const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

//Adding a Post
router.post("", checkAuth, extractFile, PostController.newPost);

//fetching all Posts
router.get("", checkAuth, PostController.listPost);

// // Fetching post by Id
// router.get("/:id", PostController.listPostById);

// //Editing Post
// router.put("/:id", checkAuth, extractFile, PostController.editPost);

// //Deleting Post
// router.delete("/:_id", checkAuth, PostController.deletePost);

module.exports = router;
