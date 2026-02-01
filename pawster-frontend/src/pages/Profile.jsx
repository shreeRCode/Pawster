import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/profile.css";

const BASE_API_URL = "https://pawster-pi.vercel.app";
const USER_API_URL = `${BASE_API_URL}/api/users`;

function Profile({ user }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchCurrentUserMongoId();
  }, [user]);

  useEffect(() => {
    if (!user || !currentUserMongoId) return;

    if (username) {
      fetchProfileByUsername(username);
    } else {
      fetchOwnProfile();
    }
  }, [user, username, currentUserMongoId]);

  const fetchCurrentUserMongoId = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${USER_API_URL}/uid/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentUserMongoId(data.user._id);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchOwnProfile = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();

      const res = await fetch(`${USER_API_URL}/uid/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setProfileData(data.user);
      setPosts(data.posts);
      setIsFollowing(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileByUsername = async (targetUsername) => {
    try {
      setLoading(true);

      const usersRes = await fetch(`${USER_API_URL}`);
      const allUsers = await usersRes.json();

      const foundUser = allUsers.find((u) => u.username === targetUsername);

      if (!foundUser) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const profileRes = await fetch(
        `${USER_API_URL}/uid/${foundUser.firebaseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await profileRes.json();
      setProfileData(data.user);
      setPosts(data.posts);

      const followerIds = data.user.followers.map((f) => {
        return typeof f === "string" ? f : f._id?.toString() || f.toString();
      });

      const isUserFollowing = followerIds.includes(currentUserMongoId);
      setIsFollowing(isUserFollowing);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData || !currentUserMongoId) return;

    try {
      const token = await user.getIdToken();
      const action = isFollowing ? "unfollow" : "follow";

      const response = await fetch(
        `${USER_API_URL}/${action}/${profileData._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentUserId: user.uid }),
        },
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);

        setProfileData((prev) => ({
          ...prev,
          followers: isFollowing
            ? prev.followers.filter((f) => {
                const fId =
                  typeof f === "string" ? f : f._id?.toString() || f.toString();
                return fId !== currentUserMongoId;
              })
            : [...prev.followers, currentUserMongoId],
        }));
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  const handleEditProfile = async () => {
    const newUsername = prompt("Enter new Username:", profileData.username);
    const newBio = prompt("Enter new Bio:", profileData.bio || "");

    if (!newUsername) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`${USER_API_URL}/edit/${user.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, bio: newBio }),
      });

      const updated = await res.json();

      setProfileData((prev) => ({
        ...prev,
        username: updated.username,
        bio: updated.bio,
      }));
    } catch (err) {
      console.error("Edit profile error:", err);
    }
  };

  if (!user) {
    return (
      <div className="profile-main">
        <p>Please login</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-main">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-main">
        <div className="profile-not-found">
          <h2>User not found</h2>
          <button onClick={() => navigate("/feed")}>Go back to feed</button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.uid === profileData.firebaseId;

  return (
    <main className="profile-main">
      <div className="profile-container">
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
                  onClick={handleEditProfile}
                >
                  Edit profile
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
                const imageSrc = post.imageUrl?.startsWith("http")
                  ? post.imageUrl
                  : `${BASE_API_URL}/${post.imageUrl}`;

                return (
                  <div key={post._id} className="post-grid-item">
                    <img
                      src={imageSrc}
                      alt={post.caption}
                      className="post-img"
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
