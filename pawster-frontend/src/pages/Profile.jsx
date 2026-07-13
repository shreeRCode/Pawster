import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProfileByUid,
  fetchAllUsers,
  followUser,
  unfollowUser,
  updateProfile,
} from "../services/api";
import { API_BASE_URL as BASE_API_URL } from "../config";
import "../styles/profile.css";

// ─── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ profileData, onSave, onClose }) {
  const [username, setUsername] = useState(profileData.username || "");
  const [bio, setBio] = useState(profileData.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ username: username.trim(), bio: bio.trim() });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Edit Profile</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-field">
          <label htmlFor="edit-username">Username</label>
          <input
            id="edit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="modal-field">
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            disabled={saving}
            placeholder="Tell the world about your pet…"
          />
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="modal-btn-save"
            onClick={handleSave}
            disabled={saving || !username.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function Profile({ user }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState("");

  // Get logged-in user's Mongo ID once
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchProfileByUid(user, user.uid);
        setCurrentUserMongoId(data.user._id);
      } catch (err) {
        console.error("Error fetching current user mongo ID:", err);
      }
    })();
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      if (!username) {
        // Own profile
        const data = await fetchProfileByUid(user, user.uid);
        setProfileData(data.user);
        setPosts(data.posts || []);
        setIsFollowing(false);
      } else {
        // Another user's profile — look them up by username
        const allUsers = await fetchAllUsers();
        const found = allUsers.find((u) => u.username === username);
        if (!found) {
          setProfileData(null);
          setLoading(false);
          return;
        }
        const data = await fetchProfileByUid(user, found.firebaseId);
        setProfileData(data.user);
        setPosts(data.posts || []);

        // Determine follow state
        const followerIds = (data.user.followers || []).map((f) =>
          typeof f === "string" ? f : f._id?.toString() || String(f),
        );
        setIsFollowing(followerIds.includes(currentUserMongoId));
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, [user, username, currentUserMongoId]);

  useEffect(() => {
    // Only load after we have currentUserMongoId (or it's own profile)
    if (!username || currentUserMongoId) {
      loadProfile();
    }
  }, [loadProfile, username, currentUserMongoId]);

  const handleFollowToggle = async () => {
    if (!profileData || !currentUserMongoId) return;
    try {
      if (isFollowing) {
        await unfollowUser(user, profileData._id);
      } else {
        await followUser(user, profileData._id);
      }
      setIsFollowing((prev) => !prev);
      setProfileData((prev) => ({
        ...prev,
        followers: isFollowing
          ? (prev.followers || []).filter((f) => {
              const id =
                typeof f === "string" ? f : f._id?.toString() || String(f);
              return id !== currentUserMongoId;
            })
          : [...(prev.followers || []), currentUserMongoId],
      }));
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  const handleSaveProfile = async (data) => {
    const updated = await updateProfile(user, data);
    setProfileData((prev) => ({ ...prev, ...updated }));
  };

  // ─── Render states ────────────────────────────────────────────────────────

  if (!user)
    return (
      <div className="profile-main">
        <p>Please log in.</p>
      </div>
    );

  if (loading) {
    return (
      <div className="profile-main">
        <div className="profile-loading">
          <div className="loading-spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-main">
        <div className="profile-not-found">
          <h2>{error || "User not found"}</h2>
          <button onClick={() => navigate("/feed")}>Go back to feed</button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.uid === profileData.firebaseId;

  return (
    <main className="profile-main">
      {showEditModal && (
        <EditModal
          profileData={profileData}
          onSave={handleSaveProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-image-container">
            <div className="profile-image-placeholder">
              {profileData.username?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-title">
              <h1 className="profile-username">{profileData.username}</h1>

              {isOwnProfile ? (
                <button
                  className="edit-profile-btn"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className={`follow-btn ${isFollowing ? "following" : ""}`}
                  onClick={handleFollowToggle}
                  disabled={!currentUserMongoId}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <strong>{posts.length}</strong>
                <span>{posts.length === 1 ? "post" : "posts"}</span>
              </div>
              <div className="stat-item">
                <strong>{profileData.followers?.length || 0}</strong>
                <span>
                  {profileData.followers?.length === 1
                    ? "follower"
                    : "followers"}
                </span>
              </div>
              <div className="stat-item">
                <strong>{profileData.following?.length || 0}</strong>
                <span>following</span>
              </div>
            </div>

            <div className="profile-bio">
              <div className="profile-name">
                {profileData.name || profileData.username}
              </div>
              <p className="profile-bio-text">
                {profileData.bio || "No bio yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div className="profile-posts">
          <div className="posts-header">
            <div className="posts-tab active">📷 POSTS</div>
          </div>

          {posts.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">📭</div>
              <h3>No posts yet</h3>
              <p>
                {isOwnProfile
                  ? "Share your first pet moment!"
                  : `${profileData.username} hasn't posted yet`}
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => {
                const src = post.imageUrl?.startsWith("http")
                  ? post.imageUrl
                  : `${BASE_API_URL}/${post.imageUrl}`;
                return (
                  <div key={post._id} className="post-grid-item">
                    <img
                      src={src}
                      alt={post.caption || "Post"}
                      className="post-img"
                      loading="lazy"
                    />
                    <div className="post-overlay">
                      <div className="overlay-stat">
                        <span>❤️</span>
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="overlay-stat">
                        <span>💬</span>
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Profile;
