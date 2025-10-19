let model = null;
let modelReady = false;
let currentUser = null;

const API_URL = "http://localhost:5000/api/posts"; // backend URL

// Load MobileNet model
async function loadModel() {
  model = await mobilenet.load();
  modelReady = true;
  console.log("MobileNet model loaded and ready.");
  document.getElementById("uploadBtn").disabled = false;
}
loadModel();

// Load posts from backend
async function loadPosts() {
  try {
    const postsContainer = document.getElementById("postsContainer");
    // Clear existing posts
    postsContainer
      .querySelectorAll(".dynamic-post")
      .forEach((post) => post.remove());

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load posts");

    const posts = await response.json();

    posts.forEach((post) => {
      const postElement = createPostElement(post, post._id);
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

// Firebase auth listener
document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
      console.log("User is signed in:", user.displayName || user.email);
      loadPosts();
      loadSuggestions();
    }
  });
});

// Elements
const imageInput = document.getElementById("imageInput");
const fileName = document.getElementById("fileName");
const imagePreview = document.getElementById("imagePreview");
const previewModal = document.getElementById("imagePreviewModal");
const closePreview = document.getElementById("closePreview");
const uploadBtn = document.getElementById("uploadBtn");
const captionInput = document.getElementById("captionInput");

// Dog labels for classification
const dogLabels = [
  "Labrador retriever",
  "Golden retriever",
  "German shepherd",
  "Beagle",
  "Bulldog",
  "Poodle",
  "Rottweiler",
  "Yorkshire terrier",
  "Boxer",
  "Dachshund",
  "Siberian husky",
  "Great Dane",
  "Maltese dog",
  "Pomeranian",
  "Border collie",
  "Chihuahua",
  "Shih Tzu",
  "Boston bull",
  "Cocker spaniel",
  "Saint Bernard",
];

let isValidDogImage = false;

function isDog(predictions) {
  return predictions.some(
    (prediction) =>
      dogLabels.some((label) =>
        prediction.className.toLowerCase().includes(label.toLowerCase())
      ) && prediction.probability > 0.3
  );
}

async function classifyAndValidateImage(imageElement) {
  if (!model) {
    alert("AI model is still loading. Please wait.");
    return false;
  }
  try {
    const predictions = await model.classify(imageElement);
    console.log("Predictions:", predictions);
    if (isDog(predictions)) {
      console.log("✅ Dog detected!");
      return true;
    } else {
      alert(
        "Please upload an image containing a dog. Only dog images are allowed!"
      );
      return false;
    }
  } catch (error) {
    console.error("Classification error:", error);
    alert("Error analyzing image. Please try again.");
    return false;
  }
}

// Image selection
imageInput.addEventListener("change", (e) => {
  if (e.target.files.length === 0) {
    fileName.style.display = "none";
    isValidDogImage = false;
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Post";
    return;
  }

  const file = e.target.files[0];
  fileName.style.display = "inline";
  fileName.textContent = "🔄 Analyzing image...";
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Checking Image...";

  const reader = new FileReader();
  reader.onload = async (e) => {
    imagePreview.src = e.target.result;

    setTimeout(async () => {
      isValidDogImage = await classifyAndValidateImage(imagePreview);
      if (isValidDogImage) {
        fileName.textContent = `✅ ${file.name} (Dog detected!)`;
        fileName.style.color = "#28a745";
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload Post";
      } else {
        fileName.textContent = `❌ ${file.name} (Not a dog)`;
        fileName.style.color = "#dc3545";
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Upload Blocked";
        imageInput.value = "";
      }
    }, 500);
  };
  reader.readAsDataURL(file);
});

// Upload post
uploadBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Please log in to upload posts!");
    return;
  }
  if (!isValidDogImage && imageInput.files.length > 0) {
    alert("Cannot upload: Please select an image containing a dog!");
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";
    const file = imageInput.files[0];
    const caption = captionInput.value;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    const token = await currentUser.getIdToken();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload post");

    alert("Post uploaded successfully!");
    imageInput.value = "";
    captionInput.value = "";
    fileName.style.display = "none";
    isValidDogImage = false;
    loadPosts();
  } catch (error) {
    console.error("Error uploading post:", error);
    alert("Error uploading post: " + error.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Post";
  }
});

// Post rendering
function createPostElement(post, postId) {
  const postDiv = document.createElement("article");
  postDiv.className = "post dynamic-post";
  postDiv.dataset.postId = postId;

  const imageSrc = post.imageUrl.startsWith("http")
    ? post.imageUrl
    : `http://localhost:5000${post.imageUrl}`;

  postDiv.innerHTML = `
    <div class="post-header">
      <div class="post-user-info">
        <img src="images/default-avatar.png" alt="User" class="post-avatar">
        <div class="post-user-details">
          <span class="post-username">${post.user.username}</span>
          <span class="post-location">${formatTimestamp(post.createdAt)}</span>
        </div>
      </div>
      <button class="post-options">...</button>
    </div>
    <div class="post-image">
      <img src="${imageSrc}" alt="post" loading="lazy">
    </div>
    <div class="post-actions">
      <div class="post-actions-left">
        <button class="action-btn like-btn">❤️</button>
        <button class="action-btn comment-btn">💬</button>
        <button class="action-btn share-btn">📤</button>
      </div>
      <button class="action-btn save-btn">🎁</button>
    </div>
    <div class="post-info">
      <div class="post-likes">
        <span>${post.likes?.length || 0} likes</span>
      </div>
      <div class="post-caption">
        <span class="caption-username">${post.user.username}</span>
        <span class="caption-text">${post.caption || ""}</span>
      </div>
      <div class="post-comments">
         ${
           post.comments && post.comments.length > 0
             ? post.comments
                 .map(
                   (comment) =>
                     `<span><b>${comment.user.username}</b> ${comment.text}</span><br>`
                 )
                 .join("")
             : '<span class="view-comments">No comments yet</span>'
         }
      </div>
      <div class="post-time">
        <span>${formatTimestamp(post.createdAt)}</span>
      </div>
    </div>
    <div class="add-comment-section">
      <input type="text" class="comment-input" placeholder="Add a comment...">
      <button class="comment-submit">Post</button>
    </div>
  `;

  return postDiv;
}

postsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("like-btn")) {
    const postDiv = e.target.closest(".post");
    const postId = postDiv.dataset.postId;
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      postDiv.querySelector(
        ".post-likes span"
      ).textContent = `${data.likes} likes`;
    } catch (err) {
      console.error("Error liking post:", err);
    }
  }
});
//to register and display comments
// To register and display comments
postsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("comment-submit")) {
    const postDiv = e.target.closest(".post");
    const postId = postDiv.dataset.postId;
    const commentInput = postDiv.querySelector(".comment-input");
    const text = commentInput.value.trim();

    // Prevent empty comment
    if (!text) return;

    try {
      // Ensure user is logged in
      if (!currentUser) {
        alert("Please log in to post comments!");
        return;
      }

      // Get Firebase token for authentication
      const token = await currentUser.getIdToken();

      // Send comment to backend
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      // Check if request succeeded
      if (!response.ok) throw new Error("Failed to post comment!");

      // Parse backend response (array of all comments)
      const comments = await response.json();

      // Find the comment container
      const commentsDiv = postDiv.querySelector(".post-comments");

      // Get the newly added comment (last in the list)
      const newComment = comments[comments.length - 1];

      // Check if "No comments yet" exists and remove it
      const noCommentsText = commentsDiv.querySelector(".view-comments");
      if (noCommentsText) {
        noCommentsText.remove(); // Remove "No comments yet"
      }

      // Append the new comment
      commentsDiv.innerHTML += `<span><b>${newComment.user.username}</b> ${newComment.text}</span><br>`;

      // Clear input box
      commentInput.value = "";
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment");
    }
  }
});

// Show/hide comment input when comment icon is clicked
postsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("comment-btn")) {
    const postDiv = e.target.closest(".post");
    const commentSection = postDiv.querySelector(".add-comment-section");
    const commentInput = postDiv.querySelector(".comment-input");

    // Toggle visibility of comment section
    if (commentSection.style.display === "none") {
      commentSection.style.display = "flex";
      commentInput.focus(); // Automatically focus on input
    } else {
      commentSection.style.display = "none";
    }
  }
});

// Timestamp formatting
function formatTimestamp(timestamp) {
  if (!timestamp) return "Just Now";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

// File preview modal
fileName.addEventListener("click", () => {
  if (imagePreview.src) previewModal.style.display = "flex";
});
closePreview.addEventListener(
  "click",
  () => (previewModal.style.display = "none")
);
previewModal.addEventListener("click", (e) => {
  if (e.target === previewModal) previewModal.style.display = "none";
});

//---Suggestions for you ---//

async function loadSuggestions() {
  if (!currentUser) return;
  try {
    //Replace with your backend users endpoint
    const userSuggestionsApi = `http://localhost:5000/api/users/suggestions/${currentUser.uid}`;
    const response = await fetch(userSuggestionsApi);
    if (!response.ok) throw new Error("Suggestion fetch failed");
    const suggestions = await response.json();
    const suggestionsList = document.getElementById("suggestionsList");
    suggestionsList.innerHTML = "";
    if (suggestions.length === 0) {
      suggestionsList.innerHTML = "<div>No suggestions available</div>";
      return;
    }
    //Render suggestions
    suggestions.forEach((user) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
      <img src="${
        user.profileImage || "images/default-avatar.png"
      }"class="suggestion-avatar" alt="User Avatar"style="width:32px;height:32px;border-radius:50%;margin-right:8px;">
      <span class="suggestion-username">${user.username}</span> 
        <span class="suggestion-name" style="color:grey;font-size:12px;">${
          user.name || ""
        }</span>
        <a href="profile.html?uid=${
          user.firebaseId
        }" class="view-profile-btn">View</a> `;
      suggestionsList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading suggestions:", error);
  }
}
