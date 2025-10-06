let model = null;
let modelReady = false;

async function loadModel() {
  model = await mobilenet.load();
  modelReady = true;
  console.log("MobileNet model loaded and ready.");
  // Enable upload button here if you disabled it initially:
  document.getElementById("uploadBtn").disabled = false;
}

// Start loading immediately after script runs
loadModel();

const imageInput = document.getElementById("imageInput");
const fileName = document.getElementById("fileName");
const imagePreview = document.getElementById("imagePreview");
const previewModal = document.getElementById("imagePreviewModal");
const closePreview = document.getElementById("closePreview");
const uploadBtn = document.getElementById("uploadBtn");
const captionInput = document.getElementById("captionInput");

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
      dogLabels.some((dogLabel) =>
        prediction.className.toLowerCase().includes(dogLabel.toLowerCase())
      ) && prediction.probability > 0.3
  );
}
async function classifyAndValidateImage(imageElement) {
  if (!model) {
    alert("AI model is still loading. Please wait and try again.");
    return false;
  }
  try {
    const predictions = await model.classify(imageElement);
    console.log("Predictions:", predictions);
    if (isDog(predictions)) {
      console.log("✅ Dog detected!");
      return true;
    } else {
      console.log("❌ No dog detected");
      alert(
        "Please upload an image consisting a dog.Only pet (dog) images are allowed!"
      );
      return false;
    }
  } catch (error) {
    console.error("Classification error:", error);
    alert("Error analyzing image. Please try again.");
    return false;
  }
}

imageInput.addEventListener("change", function (e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    fileName.textContent = file.name;
    fileName.style.display = "inline";
    //Show loading message
    fileName.textContent = "🔄 Analyzing image...";
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Checking Image...";
    //Read and preview the image
    const reader = new FileReader();
    reader.onload = async function (e) {
      imagePreview.src = e.target.result;
      //Wait a bit for image to load,then classify
      setTimeout(async () => {
        isValidDogImage = await classifyAndValidateImage(imagePreview);
        if (isValidDogImage) {
          fileName.textContent = `✅ ${file.name} (Dog detected!)`;
          fileName.style.color = "#28a745";
          uploadBtn.disabled = false;
          uploadBtn.textContent = "Upload Post";
        } else {
          fileName.textContent = `❌ ${file.name} (Not a dog)`;
          fileName.style.color = "#dc3545"; // Red color
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Upload Blocked";
          // Clear the file input
          imageInput.value = "";
        }
      }, 500);
    };
    reader.readAsDataURL(file);
  } else {
    fileName.style.display = "none";
    isValidDogImage = false;
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Post";
  }
});
uploadBtn.addEventListener("click", async function (e) {
  if (!currentUser) {
    alert("Please log in to upload posts!");
    return;
  }
  if (!isValidDogImage && imageInput.files.length > 0) {
    e.preventDefault();
    alert("Cannot upload: Please select an image containing a dog!");
    return false;
  }
  if (imageInput.files.length === 0) {
    alert("Please select an image!");
    return;
  }
  const captionInput = document.getElementById("captionInput");

  if (!captionInput.value.trim()) {
    alert("Please add a caption!");
    return;
  }
  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";
    const file = imageInput.files[0];

    // 3. Save to Firestore (v8 compat syntax)
    ents: [], alert("Post uploaded successfully");
    //Reset form
    imageInput.value = "";
    captionInput.value = "";
    fileName.style.display = "none";
    isValidDogImage = false;
    loadPosts();
  } catch (error) {
    console.error("Error uploading post:", error);
    alert("Error uploading post:", error.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Post";
  }

  //load posts function
  async function loadPosts() {
    try {
      const postsContainer = document.getElementById("postsContainer");
      //clear existing dynamic posts
      const existingPosts = postsContainer.querySelectorAll(".dynamic-post");
      existingPosts.forEach((post) => post.remove());
      //Create new posts from Firebase data
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  }
  //This function converts Firebase data into HTML elements
  function createPostElement(post, postId) {
    const postDiv = document.createElement("article");
    postDiv.className = "post dynamic-post";
    postDiv.innerHTML = `
  <div class="post-header">
    <div class="post-user-info">
        <img src="images/default-avatar.png" alt="User" class="post-avatar">
            <div class="post-user-details">
                <span class="post-username">${post.username}</span>
                  <span class="post-location">${formatTimestamp(
                    post.createdAt
                  )}</span>
            </div>
    </div>
      <button class="post-options">...</button>
  </div>
  <div class="post-image">
    <!-- If you want a default sample image -->
    <img src="${post.imageUrl}" alt="post" loading="lazy">

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
                            <span>${post.likes || 0} likes</span>
                        </div>
                        <div class="post-caption">
                            <span class="caption-username">${
                              post.username
                            }</span>
                            <span class="caption-text">${post.caption}</span>
                        </div>
                        <div class="post-comments">
                            <span class="view-comments">View all comments</span>
                        </div>
                        <div class="post-time">
                            <span>${formatTimestamp(post.createdAt)}</span>
                        </div>
                    </div>`;
    return postDiv;
  }
  //Helper function for timestamps
  function formatTimestamp(timestamp) {
    if (!timestamp) return "Just Now";
    const date = timestamp.toDate(); // Firebase timestamps have a special .toDate() method that converts to JavaScript Date object
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }
  //call load posts when authentication is ready
  let currentUser = null;

  // When user clicks on filename, show preview
  fileName.addEventListener("click", function () {
    if (imagePreview.src) {
      previewModal.style.display = "flex";
    }
  });
  document.addEventListener("DOMContentLoaded", function () {
    // Wait for Firebase to be ready
    firebase.auth().onAuthStateChanged((user) => {
      currentUser = user;
      if (user) {
        console.log("User is signed in:", user.displayName || user.email);
        loadPosts();
      }
    });
  });
  // Close preview when clicking X or outside
  closePreview.addEventListener("click", function () {
    previewModal.style.display = "none";
  });
  previewModal.addEventListener("click", function (e) {
    if (e.target == previewModal) {
      previewModal.style.display = "none";
    }
  });
});
