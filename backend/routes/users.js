const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

//Get user profile+posts

router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers", "username")
      .populate("following", "username");
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = (await Post.find({ user: user._id })).sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/follow/:id", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    if (req.params.id === currentUserId) {
      return res.status(400).json({ message: "You cant follow yourself!!" });
    }
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow.followers.includes(currentUserId)) {
      userToFollow.followers.push(currentUserId);
      currentUser.following.push(req.params.id);
      await userToFollow.save();
      await currentUser.save();
      res.json({ message: "Followed successfully" });
    } else {
      res.json({ message: "Already following" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/unfollow/:id", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(currentUserId);
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    await userToUnfollow.save();
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
