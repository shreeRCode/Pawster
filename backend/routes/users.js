const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("username name bio profileImage firebaseId followers following")
      .limit(20) // Limit to prevent too much data
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ===============================
// Get user profile + posts
// ===============================
router.get("/uid/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.uid })
      .populate("followers", "username name")
      .populate("following", "username name");

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        firebaseId: user.firebaseId,
        username: user.username,
        name: user.name,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      },
      posts,
      currentUserMongoId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// Edit profile
// ===============================
router.put("/edit/:uid", async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findOne({ firebaseId: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username && username.trim()) user.username = username;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ username: user.username, bio: user.bio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// Follow
// ===============================
router.post("/follow/:id", async (req, res) => {
  try {
    const { currentUserId } = req.body;

    if (req.params.id === currentUserId)
      return res.status(400).json({ message: "You cannot follow yourself" });

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findOne({ firebaseId: currentUserId });

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollow._id);

      await userToFollow.save();
      await currentUser.save();

      return res.json({ message: "Followed successfully" });
    }

    res.json({ message: "Already following" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// Unfollow
// ===============================
router.post("/unfollow/:id", async (req, res) => {
  try {
    const { currentUserId } = req.body;

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findOne({ firebaseId: currentUserId });

    if (!userToUnfollow || !currentUser)
      return res.status(404).json({ message: "User not found" });

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString(),
    );

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString(),
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// Suggestions
// ===============================
router.get("/suggestions/:uid", async (req, res) => {
  try {
    const currentUser = await User.findOne({
      firebaseId: req.params.uid,
    }).populate("following");

    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    const followingIds = currentUser.following.map((f) => f._id.toString());

    followingIds.push(currentUser._id.toString());

    const suggestions = await User.find({
      _id: { $nin: followingIds },
    })
      .limit(5)
      .select("username name profileImage firebaseId");

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
