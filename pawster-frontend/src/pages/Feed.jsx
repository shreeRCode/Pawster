import { useEffect, useState } from "react";
import Upload from "../components/Upload";
import Post from "../components/Post";
import Suggestions from "../components/Suggestions";
import "../styles/feed.css";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchCurrentUserMongoId();
    }
  }, [user]);

  const fetchCurrentUserMongoId = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BASE_API_URL}/api/users/uid/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentUserMongoId(data.user._id);
    } catch (err) {
      console.error("Error fetching user MongoDB ID:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_API_URL}/api/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="feed-container">
        <Upload user={user} onPostUploaded={fetchPosts} />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading posts...</p>
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
                refreshPosts={fetchPosts}
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
