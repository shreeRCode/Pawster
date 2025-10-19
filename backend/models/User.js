const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: String,
    profileImage: String,
    name: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
