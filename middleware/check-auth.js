/*so we are using this middleware to check if the user 
is authenticated using our jwt token created in /login route we 
just have to import this and add to the middle-ware  we want to check-auth */

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

function extractBearerToken(inputStr) {
  const match = inputStr.match(/Bearer\s+(\S+)/i);
  return match ? match[1] : null;
}

module.exports = (req, res, next) => {
  try {
    console.log("=====Check-Auth-Middle-Ware=====");
    console.log("split 1 " + extractBearerToken(req.headers.authorization));

    const token = extractBearerToken(req.headers.authorization);

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated" });
  }
};
