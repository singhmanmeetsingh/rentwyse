const Post = require("../models/post");
const mongoose = require("mongoose");

exports.newPost = (req, res, next) => {
  // We already imported the multer middle-ware in the route
  const url = req.protocol + "://" + req.get("host");

  const images = req.files.map((file) => url + "/images/" + file.filename);

  console.log("Rental Property Images " + images);

  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    imagePath: images, // storing all images in an array
    creator: req.userData.userId,
    bedroom: req.body.bedroom,
    bathroom: req.body.bathroom,
    furnished: req.body.furnished,
    typeOfProperty: req.body.typeOfProperty,
    parkingAvailable: req.body.parkingAvailable,
    rentType: req.body.rentType,
    city: req.body.city,
    address: req.body.address,
    province: req.body.province,
    zipcode: req.body.zipcode,
    country: req.body.country,
    price: req.body.price,
    dateListed: req.body.dateListed,
    dateAvailableForRent: req.body.dateAvailableForRent,
  });

  console.log(req.body);
  console.log(post);

  post
    .save()
    .then((result) => {
      res.status(201).json({
        post: {
          _id: result._id,
          title: result.title,
          description: result.description,
          imagePath: result.imagePaths, // returning all image paths
          creator: req.userData.userId,
          bedroom: result.bedroom,
          bathroom: result.bathroom,
          furnished: result.furnished,
          typeOfProperty: result.typeOfProperty,
          parkingAvailable: result.parkingAvailable,
          rentType: result.rentType,
          city: result.city,
          address: result.address,
          province: result.province,
          zipcode: result.zipcode,
          country: result.country,
          price: result.price,
          dateListed: result.dateListed,
          dateAvailableForRent: result.dateAvailableForRent,
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

exports.listPostByUserId = (req, res, next) => {
  const userId = req.userData.userId; // Get user ID from request data
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;

  // Check if userId is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const postQuery = Post.find({ creator: userId }); // Filtering the  posts by user ID
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments({ creator: userId }); // Count only posts by this user
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Fetching posts failed: " + error.message });
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

  // Check if there are new images uploaded
  if (req.files) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = req.files.map((file) => url + "/images/" + file.filename);
  }

  // Create an object for the updated post data
  const postUpdateData = {
    _id: req.body.id,
    description: req.body.description,
    creator: req.userData.userId,
    bedRoom: req.body.bedRoom,
    bathroom: req.body.bathroom,
    furnished: req.body.furnished,
    typeOfProperty: req.body.typeOfProperty,
    parkingAvailable: req.body.parkingAvailable,
    rentType: req.body.rentType,
    city: req.body.city,
    address: req.body.address,
    province: req.body.province,
    zipcode: req.body.zipcode,
    country: req.body.country,
    price: req.body.price,
    dateListed: req.body.dateListed,
    dateAvailableForRent: req.body.dateAvailableForRent,
  };

  // Only update imagePath if new images were uploaded
  if (imagePath) {
    postUpdateData.imagePath = imagePath;
  }

  console.log(req, postUpdateData, req.userData.creator);

  // Update the post with the new data
  Post.updateOne({ _id: postId, creator: req.userData.userId }, postUpdateData)
    .then((result) => {
      console.log("Update result = ", result);
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Update Successful!" });
      } else {
        res.status(200).json({ message: "No Change was made" });
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

exports.listPostSearch = async(req, res, next) => {
  try {
    const { city, bedroom, bathroom, furnished, parkingAvailable, price } = req.query;

     const query = {};

     // if (city) query.city = city;
     //below code is for the search string case-insensitive
    if (city) query.city = { $regex: new RegExp(city, 'i') };
    if (bedroom) query.bedroom = bedroom;
    if (bathroom) query.bathroom = bathroom;
    if (furnished) query.furnished = furnished === 'true';
    if (parkingAvailable) query.parkingAvailable = parkingAvailable === 'true';
    if (price) query.price = { $lte: parseInt(price) };

    const results = await  Post.find(query);
    res.status(200).json(results);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}