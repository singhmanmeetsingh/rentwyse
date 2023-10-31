const Post = require("../models/post");

exports.newPost = (req, res, next) => {
  // We already imported the multer middle-ware in the route
  const url = req.protocol + "://" + req.get("host");

  const images = req.files.map((file) => url + "/images/" + file.filename);

  console.log("Rental Property Images " + images);
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: images, // storing all images in an array
    creator: req.userData.userId,
    city: req.body.city,
    address: req.body.address,
    province: req.body.province,
    zipcode: req.body.zipcode,
    country: req.body.country,
  });

  console.log(req.userData);
  console.log(post);

  post
    .save()
    .then((result) => {
      res.status(201).json({
        post: {
          _id: result._id,
          title: result.title,
          content: result.content,
          imagePath: result.imagePaths, // returning all image paths
          creator: req.userData.userId,
          city: req.body.city,
          address: req.body.address,
          province: req.body.province,
          zipcode: req.body.zipcode,
          country: req.body.country,
        },
        message: "Post added successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Creating Post failed" });
    });
};

exports.listPost = (req, res, next) => {
  console.log(req.query); // to see the query parameter in the requests
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page; // we need to convert this to a numeric value as it comes as a string from the req so we add a + in front
  const postQuery = Post.find(); // when doing this the function is not called until you use the .then at the back of it so thats why we can do this here !!
  let fetchedPost;
  if (pageSize && currentPage) {
    // this is for pagination
    postQuery
      .skip(pageSize * (currentPage - 1)) // as the name suggests we are using skip to skip through the pages we dont want to see
      .limit(pageSize); // we use this to limit the amount of data being sent back
  }
  postQuery
    .then((documents) => {
      fetchedPost = documents;
      return Post.count();
    })
    .then((count) => {
      console.log(fetchedPost);
      res.status(200).json({
        message: "Post fetched successfully!",
        posts: fetchedPost,
        maxPost: count,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Fetching posts failed !!" });
    });
};

exports.listPostById = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      console.log(req.params.id);
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not Found" });
      }
    })
    .catch((error) => {
      console.error("Error during the search operation:", error);
      res.status(500).json({ message: "Fetching Post failed" });
    });
};

exports.editPost = (req, res, next) => {
  const postId = req.params.id;
  let imagePath = req.body.imagePath;
  const url = req.protocol + "://" + req.get("host");
  imagePath = req.files.map((file) => url + "/images/" + file.filename);
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    city: req.body.city,
    address: req.body.address,
    province: req.body.province,
    zipcode: req.body.zipcode,
    country: req.body.country,
  });
  console.log(post, req.userData.creator);

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      console.log("Update result = ");
      console.log(result);
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Update Successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch((error) => {
      console.error("Error during the update operation:", error);
      res.status(500).json({ message: "Update Failed!" });
    });
};

exports.deletePost = (req, res, next) => {
  console.log(req.params._id);
  Post.deleteOne({ _id: req.params._id, creator: req.userData.userId })
    .then((result) => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Delete Successful!" });
      } else {
        res.status(401).json({ message: "Not Authorized!" });
      }
    })
    .catch((error) => {
      console.error("Error during the Delete operation:", error);
      res.status(500).json({ message: "Delete Failed!" });
    });
};
