const admin = require("../config/firebase");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ firebaseId: decodedToken.uid });
    if (!user) {
      user = new User({
        firebaseId: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        username: decodedToken.email.split("@")[0],
      });
      await user.save();
    }
    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
module.exports = { verifyToken };
