import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/feed.css";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Suggestions({ user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_API_URL}/api/users/suggestions/${user.uid}`,
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error loading suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = await user.getIdToken();
      await fetch(`${BASE_API_URL}/api/users/follow/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUserId: user.uid }),
      });

      // Remove from suggestions after following
      setSuggestions(suggestions.filter((s) => s._id !== userId));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  // Navigate to user's profile
  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="suggestions-container">
        <div className="suggestions-header">
          <h3>Suggestions for you</h3>
          <button className="see-all-btn" onClick={fetchSuggestions}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="suggestions-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="suggestions-empty">
            <p>No suggestions available</p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((s) => (
              <div key={s._id} className="suggestion-item">
                {/* Clickable avatar */}
                <div
                  className="suggestion-avatar clickable"
                  onClick={() => handleProfileClick(s.username)}
                >
                  {s.username?.charAt(0).toUpperCase()}
                </div>

                {/* Clickable username */}
                <div className="suggestion-info">
                  <span
                    className="suggestion-username clickable"
                    onClick={() => handleProfileClick(s.username)}
                  >
                    {s.username}
                  </span>
                  <span className="suggestion-bio">
                    {s.name || "New to Pawster"}
                  </span>
                </div>

                {/* Follow button */}
                <button
                  className="follow-btn"
                  onClick={() => handleFollow(s._id)}
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="sidebar-footer">
        <p>© 2025 Pawster</p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Help</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </aside>
  );
}

export default Suggestions;
