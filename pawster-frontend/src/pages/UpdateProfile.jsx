import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Post from "../components/Post";
import "../styles/profile.css";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Profile({ user }) {
  const { username } = useParams(); // Get username from URL
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserMongoId, setCurrentUserMongoId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCurrentUserMongoId();
    }
  }, [user]);

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username]);

  // Fetch current logged-in user's MongoDB ID
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

  // Fetch profile user data and their posts
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Get all users to find the one with matching username
      const usersRes = await fetch(`${BASE_API_URL}/api/users`);
      const allUsers = await usersRes.json();

      // Find user by username
      const foundUser = allUsers.find((u) => u.username === username);

      if (!foundUser) {
        console.error("User not found");
        setLoading(false);
        return;
      }

      setProfileUser(foundUser);

      // Check if current user is following this profile
      if (user && foundUser.followers) {
        // Note: You'll need to compare MongoDB IDs
        setIsFollowing(
          foundUser.followers.some(
            (follower) => follower._id === currentUserMongoId,
          ),
        );
      }

      // Fetch posts by this user
      const postsRes = await fetch(`${BASE_API_URL}/api/posts`);
      const allPosts = await postsRes.json();

      // Filter posts by this user
      const userPosts = allPosts.filter(
        (post) => post.user.username === username,
      );

      setPosts(userPosts);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user || !profileUser) return;

    try {
      const token = await user.getIdToken();
      const endpoint = isFollowing ? "unfollow" : "follow";

      await fetch(`${BASE_API_URL}/api/users/${endpoint}/${profileUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUserId: user.uid }),
      });

      setIsFollowing(!isFollowing);

      // Refresh profile data to update follower count
      fetchProfileData();
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-not-found">
        <h2>User not found</h2>
        <button onClick={() => navigate("/")}>Go back to feed</button>
      </div>
    );
  }

  // Check if viewing own profile
  const isOwnProfile = user && profileUser.firebaseId === user.uid;

  return (
    <div className="profile-main">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-image-container">
            <div className="profile-image-placeholder">
              {profileUser.username?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-title">
              <h1 className="profile-username">{profileUser.username}</h1>

              {isOwnProfile ? (
                <button
                  className="edit-profile-btn"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className={`follow-btn ${isFollowing ? "following" : ""}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <strong>{posts.length}</strong>
                <span>{posts.length === 1 ? "post" : "posts"}</span>
              </div>
              <div className="stat-item">
                <strong>{profileUser.followers?.length || 0}</strong>
                <span>followers</span>
              </div>
              <div className="stat-item">
                <strong>{profileUser.following?.length || 0}</strong>
                <span>following</span>
              </div>
            </div>

            {/* Bio */}
            {profileUser.name && (
              <div className="profile-name">{profileUser.name}</div>
            )}
            {profileUser.bio && (
              <div className="profile-bio-text">{profileUser.bio}</div>
            )}
          </div>
        </div>

        {/* Posts Grid */}
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
                  : `${profileUser.username} hasn't posted yet`}
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post._id} className="post-grid-item">
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="post-img"
                  />
                  <div className="post-overlay">
                    <div className="overlay-stat">
                      ❤️ {post.likes?.length || 0}
                    </div>
                    <div className="overlay-stat">
                      💬 {post.comments?.length || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
