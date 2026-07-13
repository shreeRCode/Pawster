import { useEffect, useState, useCallback } from "react";
import Upload from "../components/Upload";
import Post from "../components/Post";
import Suggestions from "../components/Suggestions";
import { fetchPosts, fetchProfileByUid } from "../services/api";
import "../styles/feed.css";

const PAGE_SIZE = 10;

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPosts(1, PAGE_SIZE);
      setPosts(data.posts || []);
      setPage(1);
      setHasMore(!!data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await fetchPosts(next, PAGE_SIZE);
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setPage(next);
      setHasMore(!!data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

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
          <>
            <div className="posts-section">
              {posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  user={user}
                  currentUserMongoId={currentUserMongoId}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Suggestions user={user} />
    </main>
  );
}

export default Feed;
