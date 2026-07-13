import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSuggestions, followUser } from "../services/api";

function Suggestions({ user }) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await fetchSuggestions(user.uid);
      setSuggestions(data);
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (mongoId) => {
    try {
      await followUser(user, mongoId);
      setSuggestions((prev) => prev.filter((s) => s._id !== mongoId));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="suggestions-container">
        <div className="suggestions-header">
          <h3>Suggestions for you</h3>
          <button className="see-all-btn" onClick={loadSuggestions}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="suggestions-loading">
            <div className="loading-spinner" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="suggestions-empty">
            <p>No suggestions available</p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((s) => (
              <div key={s._id} className="suggestion-item">
                <div
                  className="suggestion-avatar clickable"
                  onClick={() => navigate(`/profile/${s.username}`)}
                >
                  {s.username?.charAt(0).toUpperCase()}
                </div>
                <div className="suggestion-info">
                  <span
                    className="suggestion-username clickable"
                    onClick={() => navigate(`/profile/${s.username}`)}
                  >
                    {s.username}
                  </span>
                  <span className="suggestion-bio">
                    {s.name || "New to Pawster"}
                  </span>
                </div>
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
      </footer>
    </aside>
  );
}

export default Suggestions;
