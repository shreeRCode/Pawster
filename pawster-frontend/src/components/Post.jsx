import { useState, useEffect } from "react";
import "../styles/feed.css";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Post({ post, user, currentUserMongoId, refreshPosts }) {
  const [commentText, setCommentText] = useState("");

  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    currentUserMongoId && post.likes?.includes(currentUserMongoId),
  );

  useEffect(() => {
    if (currentUserMongoId) {
      setLikes(post.likes || []);
      setIsLiked(post.likes?.includes(currentUserMongoId));
    }
  }, [post.likes, currentUserMongoId]);

  const handleLike = async () => {
    if (!user || !currentUserMongoId) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    if (newIsLiked) {
      setLikes([...likes, currentUserMongoId]);
    } else {
      setLikes(likes.filter((id) => id !== currentUserMongoId));
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(
        `${BASE_API_URL}/api/posts/${post._id}/like`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        setIsLiked(!newIsLiked);
        setLikes(post.likes || []);
      }

      refreshPosts();
    } catch (error) {
      console.error("Like error:", error);
      setIsLiked(!newIsLiked);
      setLikes(post.likes || []);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const token = await user.getIdToken();

    try {
      await fetch(`${BASE_API_URL}/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      setCommentText("");
      refreshPosts();
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && commentText.trim()) {
      e.preventDefault();
      handleComment();
    }
  };

  const imageSrc = post.imageUrl.startsWith("http")
    ? post.imageUrl
    : `${BASE_API_URL}/${post.imageUrl}`;

  // ✅ SAFE USER FALLBACK
  const username = post.user?.username || "Unknown User";

  return (
    <article className="post">
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-avatar">{username.charAt(0).toUpperCase()}</div>
          <div>
            <span className="post-username">{username}</span>
          </div>
        </div>
      </div>

      <div className="post-image">
        <img src={imageSrc} alt="post" loading="lazy" />
      </div>

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`post-action-btn ${isLiked ? "liked" : ""}`}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <button className="post-action-btn">💬</button>
        <button className="post-action-btn">📤</button>
      </div>

      <div className="post-info">
        <div className="post-likes">
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </div>

        {post.caption && (
          <div className="post-caption">
            <strong>{username}</strong> {post.caption}
          </div>
        )}

        {/* ✅ SAFE COMMENTS RENDERING */}
        {post.comments?.length > 0 && (
          <div className="post-comments">
            {post.comments.map((c) => {
              if (!c.user) return null; // skip broken comments

              return (
                <div key={c._id} className="comment">
                  <strong>{c.user.username}</strong> {c.text}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {user && (
        <div className="add-comment-section">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
          />
          <button onClick={handleComment} disabled={!commentText.trim()}>
            Post
          </button>
        </div>
      )}
    </article>
  );
}

export default Post;
