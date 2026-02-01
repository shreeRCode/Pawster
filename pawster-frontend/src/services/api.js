const BASE_API_URL = "https://pawster-pi.vercel.app";

const getAuthHeaders = async (user) => {
  if (!user) return {};

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* ===========================
   POSTS
=========================== */

export const fetchPosts = async () => {
  const res = await fetch(`${BASE_API_URL}/api/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const createPost = async (user, formData) => {
  const headers = await getAuthHeaders(user);

  const res = await fetch(`${BASE_API_URL}/api/posts`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const likePost = async (user, postId) => {
  const headers = await getAuthHeaders(user);

  const res = await fetch(`${BASE_API_URL}/api/posts/${postId}/like`, {
    method: "PUT",
    headers,
  });

  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
};

export const addComment = async (user, postId, text) => {
  const headers = {
    ...(await getAuthHeaders(user)),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_API_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
};

/* ===========================
   USERS / PROFILE
=========================== */

export const fetchProfile = async (user, uid) => {
  const headers = await getAuthHeaders(user);

  const res = await fetch(`${BASE_API_URL}/api/users/uid/${uid}`, { headers });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export const followUser = async (user, mongoUserId) => {
  const headers = {
    ...(await getAuthHeaders(user)),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_API_URL}/api/users/follow/${mongoUserId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ currentUserId: user.uid }),
  });

  if (!res.ok) throw new Error("Follow failed");
  return res.json();
};

export const unfollowUser = async (user, mongoUserId) => {
  const headers = {
    ...(await getAuthHeaders(user)),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_API_URL}/api/users/unfollow/${mongoUserId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ currentUserId: user.uid }),
  });

  if (!res.ok) throw new Error("Unfollow failed");
  return res.json();
};

export const updateProfile = async (user, data) => {
  const headers = {
    ...(await getAuthHeaders(user)),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_API_URL}/api/users/edit/${user.uid}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Profile update failed");
  return res.json();
};

/* ===========================
   SUGGESTIONS
=========================== */

export const fetchSuggestions = async (user) => {
  const res = await fetch(`${BASE_API_URL}/api/users/suggestions/${user.uid}`);

  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
};
