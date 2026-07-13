import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { likePost, addComment } from "../services/api";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Post({ post, user, currentUserMongoId, refreshPosts }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    !!(currentUserMongoId && post.likes?.includes(currentUserMongoId)),
  );
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    setLikes(post.likes || []);
    setIsLiked(
      !!(currentUserMongoId && post.likes?.includes(currentUserMongoId)),
    );
  }, [post.likes, currentUserMongoId]);

  const handleLike = async () => {
    if (!user || !currentUserMongoId) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) =>
      newIsLiked
        ? [...prev, currentUserMongoId]
        : prev.filter((id) => id !== currentUserMongoId),
    );

    try {
      await likePost(user, post._id);
      refreshPosts();
    } catch {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikes(post.likes || []);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(user, post._id, commentText);
      setCommentText("");
      refreshPosts();
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  const imageSrc = post.imageUrl?.startsWith("http")
    ? post.imageUrl
    : `${BASE_API_URL}/${post.imageUrl}`;

  const username = post.user?.username || "Unknown";

  return (
    <article className="post">
      <div className="post-header">
        <div className="post-user-info">
          <div
            className="post-avatar clickable"
            onClick={() => navigate(`/profile/${username}`)}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span
              className="post-username clickable"
              onClick={() => navigate(`/profile/${username}`)}
            >
              {username}
            </span>
          </div>
        </div>
      </div>

      <div className="post-image">
        <img src={imageSrc} alt={post.caption || "Pet post"} loading="lazy" />
      </div>

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`post-action-btn ${isLiked ? "liked" : ""}`}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <button
          className="post-action-btn"
          aria-label="Comment"
          onClick={() => commentInputRef.current?.focus()}
        >
          💬
        </button>
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

        {post.comments?.length > 0 && (
          <div className="post-comments">
            {post.comments.map((c) => {
              if (!c?.user) return null;
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
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            disabled={submitting}
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
          >
            Post
          </button>
        </div>
      )}
    </article>
  );
}

export default Post;
