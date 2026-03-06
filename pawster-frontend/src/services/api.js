const BASE_API_URL = "https://pawster-pi.vercel.app";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getAuthHeaders = async (user) => {
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const jsonHeaders = async (user) => ({
  ...(await getAuthHeaders(user)),
  "Content-Type": "application/json",
});

// ─── Posts ───────────────────────────────────────────────────────────────────

export const fetchPosts = async () => {
  const res = await fetch(`${BASE_API_URL}/api/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const createPost = async (user, formData) => {
  const res = await fetch(`${BASE_API_URL}/api/posts`, {
    method: "POST",
    headers: await getAuthHeaders(user),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const likePost = async (user, postId) => {
  const res = await fetch(`${BASE_API_URL}/api/posts/${postId}/like`, {
    method: "PUT",
    headers: await getAuthHeaders(user),
  });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
};

export const addComment = async (user, postId, text) => {
  const res = await fetch(`${BASE_API_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: await jsonHeaders(user),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
};

// ─── Users / Profile ─────────────────────────────────────────────────────────

export const fetchProfileByUid = async (user, uid) => {
  const res = await fetch(`${BASE_API_URL}/api/users/uid/${uid}`, {
    headers: await getAuthHeaders(user),
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export const fetchAllUsers = async () => {
  const res = await fetch(`${BASE_API_URL}/api/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const syncUser = async (firebaseUser, overrides = {}) => {
  const res = await fetch(`${BASE_API_URL}/api/users/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firebaseId: firebaseUser.uid,
      email: firebaseUser.email,
      username:
        overrides.username ||
        firebaseUser.email.split("@")[0] + "_" + Date.now(),
      displayName:
        overrides.displayName ||
        firebaseUser.displayName ||
        firebaseUser.email.split("@")[0],
      name:
        overrides.name ||
        firebaseUser.displayName ||
        firebaseUser.email.split("@")[0],
    }),
  });
  if (!res.ok) throw new Error("Failed to sync user");
  return res.json();
};

export const followUser = async (user, mongoUserId) => {
  const res = await fetch(`${BASE_API_URL}/api/users/follow/${mongoUserId}`, {
    method: "POST",
    headers: await jsonHeaders(user),
    body: JSON.stringify({ currentUserId: user.uid }),
  });
  if (!res.ok) throw new Error("Follow failed");
  return res.json();
};

export const unfollowUser = async (user, mongoUserId) => {
  const res = await fetch(`${BASE_API_URL}/api/users/unfollow/${mongoUserId}`, {
    method: "POST",
    headers: await jsonHeaders(user),
    body: JSON.stringify({ currentUserId: user.uid }),
  });
  if (!res.ok) throw new Error("Unfollow failed");
  return res.json();
};

export const updateProfile = async (user, data) => {
  const res = await fetch(`${BASE_API_URL}/api/users/edit/${user.uid}`, {
    method: "PUT",
    headers: await jsonHeaders(user),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Profile update failed");
  return res.json();
};

export const fetchSuggestions = async (uid) => {
  const res = await fetch(`${BASE_API_URL}/api/users/suggestions/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
};
