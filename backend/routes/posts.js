const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
//Get all Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username displayName profileImage")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });
    await Post.populate(posts, {
      path: "comments.user",
      select: "username displayName profileImage",
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//POST create new Post
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const post = new Post({
      user: req.user._id,
      firebaseUserId: req.user.firebaseId,
      imageUrl,
      caption,
    });
    await post.save();
    await post.populate("user", "username displayName profileImage");
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//PUT toggle like

router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a comment to a post
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(req.params.id).populate(
      "comments.user",
      "username displayName profileImage"
    );
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    await post.populate({
      path: "comments.user",
      select: "username displayName profileImage",
    });
    res.status(201).json(post.comments); // return all comments
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
