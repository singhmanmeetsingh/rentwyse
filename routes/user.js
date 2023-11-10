const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

//verifying the email token sent
router.get("/verify-email", UserController.verifyEmail);

router.get("/getUserDetails/:id",checkAuth ,UserController.getUserDetails);

router.put("/updateUser/:id", UserController.updateUser);

module.exports = router;
