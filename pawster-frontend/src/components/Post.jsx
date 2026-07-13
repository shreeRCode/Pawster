import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Trash2, X } from "lucide-react";
import {
  likePost,
  addComment,
  deletePost,
  deleteComment,
} from "../services/api";
import { API_BASE_URL as BASE_API_URL } from "../config";
import { timeAgo } from "../utils/time";

function Post({ post, user, currentUserMongoId, onPostDeleted }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(
    !!(currentUserMongoId && post.likes?.includes(currentUserMongoId)),
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    setLikes(post.likes || []);
    setIsLiked(
      !!(currentUserMongoId && post.likes?.includes(currentUserMongoId)),
    );
  }, [post.likes, currentUserMongoId]);

  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const postOwnerId = post.user?._id || post.user;
  const isOwnPost = !!currentUserMongoId && postOwnerId === currentUserMongoId;

  const handleLike = async () => {
    if (!user || !currentUserMongoId) return;

    // Optimistic update — no full-feed refetch needed.
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) =>
      newIsLiked
        ? [...prev, currentUserMongoId]
        : prev.filter((id) => id !== currentUserMongoId),
    );

    try {
      await likePost(user, post._id);
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
      const updated = await addComment(user, post._id, commentText);
      setComments(updated);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (deleting) return;
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deletePost(user, post._id);
      onPostDeleted?.(post._id);
    } catch (err) {
      console.error("Delete post error:", err);
      setDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updated = await deleteComment(user, post._id, commentId);
      setComments(updated);
    } catch (err) {
      console.error("Delete comment error:", err);
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
            {post.createdAt && (
              <span className="post-time">{timeAgo(post.createdAt)}</span>
            )}
          </div>
        </div>

        {isOwnPost && (
          <button
            className="post-delete-btn"
            onClick={handleDeletePost}
            disabled={deleting}
            aria-label="Delete post"
            title="Delete post"
          >
            <Trash2 size={18} />
          </button>
        )}
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
          <Heart
            size={24}
            fill={isLiked ? "#ef4444" : "none"}
            color={isLiked ? "#ef4444" : "currentColor"}
          />
        </button>
        <button
          className="post-action-btn"
          aria-label="Comment"
          onClick={() => commentInputRef.current?.focus()}
        >
          <MessageCircle size={24} />
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

        {comments.length > 0 && (
          <div className="post-comments">
            {comments.map((c) => {
              if (!c?.user) return null;
              const canDelete =
                !!currentUserMongoId &&
                (c.user._id === currentUserMongoId || isOwnPost);
              return (
                <div key={c._id} className="comment">
                  <span className="comment-text">
                    <strong>{c.user.username}</strong> {c.text}
                  </span>
                  {canDelete && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(c._id)}
                      aria-label="Delete comment"
                      title="Delete comment"
                    >
                      <X size={16} />
                    </button>
                  )}
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
