const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ds23kbhmn",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
// CORS middleware for posts routes
// router.use((req, res, next) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://pawster-2rfz.vercel.app"
//   ); // your frontend
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   // Handle preflight OPTIONS request
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204);
//   }

//   next();
// });

const upload = multer({ storage });

//Get all Posts (paginated)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate("user", "username displayName profileImage")
        .populate("comments.user", "username displayName profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//POST create new Post
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = req.file ? req.file.path : null;
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
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
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
      "username displayName profileImage",
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

// DELETE a post (author only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.user.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted", _id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a comment (comment author or post owner)
router.delete("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const isCommentAuthor = comment.user && comment.user.equals(req.user._id);
    const isPostOwner = post.user.equals(req.user._id);
    if (!isCommentAuthor && !isPostOwner) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this comment" });
    }

    post.comments.pull(req.params.commentId);
    await post.save();
    await post.populate({
      path: "comments.user",
      select: "username displayName profileImage",
    });
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
