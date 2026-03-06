import { useEffect, useState, useCallback } from "react";
import Upload from "../components/Upload";
import Post from "../components/Post";
import Suggestions from "../components/Suggestions";
import { fetchPosts, fetchProfileByUid } from "../services/api";
import "../styles/feed.css";

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchProfileByUid(user, user.uid);
        setCurrentUserMongoId(data.user._id);
      } catch (err) {
        console.error("Could not fetch mongo ID:", err);
      }
    })();
  }, [user]);

  return (
    <main className="main-content">
      <div className="feed-container">
        <Upload user={user} onPostUploaded={loadPosts} />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading posts…</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>{error}</h3>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No posts yet</h3>
            <p>Be the first to share a moment with your pet!</p>
          </div>
        ) : (
          <div className="posts-section">
            {posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                user={user}
                currentUserMongoId={currentUserMongoId}
                refreshPosts={loadPosts}
              />
            ))}
          </div>
        )}
      </div>

      <Suggestions user={user} />
    </main>
  );
}

export default Feed;
