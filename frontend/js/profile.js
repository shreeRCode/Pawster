const API_URL = "http://localhost:5000/api/users";

const usernameElem = document.querySelector(".profile-username");
const bioElem = document.querySelector(".bio-text");
const editBtn = document.querySelector(".edit-profile-btn");
const postsGrid = document.getElementById("postsGrid");
const followBtn = document.getElementById("followBtn");
const stats = document.querySelectorAll(".stat-number");
const postsCountElem = stats[0];
const followersCountElem = stats[1];
const followingCountElem = stats[2];
const nameElem = document.querySelector(".bio-name");

const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get("uid");

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  const currentUserId = user.uid;
  const token = await user.getIdToken();

  try {
    const res = await fetch(`${API_URL}/uid/${profileUserId || user.uid}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to fetch profile");
    }
    const data = await res.json();
    const userToView = data.user;
    const posts = data.posts;

    usernameElem.textContent = userToView.username;
    nameElem.textContent = userToView.name || userToView.username;
    bioElem.textContent = userToView.bio || "No bio yet";
    postsCountElem.textContent = posts.length;
    followersCountElem.textContent = userToView.followers.length;
    followingCountElem.textContent = userToView.following.length;

    postsGrid.innerHTML = "";
    if (posts.length > 0) {
      posts.forEach((post) => {
        const img = document.createElement("img");
        img.src =
          post.imageUrl && post.imageUrl.startsWith("http")
            ? post.imageUrl
            : `http://localhost:5000${post.imageUrl || ""}`;
        img.onerror = () => {
          img.src = "images/default-post.png"; // fallback/default image in case missing/broken
        };
        img.classList.add("post-img");
        postsGrid.appendChild(img);
      });
    } else {
      postsGrid.innerHTML = `<div class="no-posts">
        <div class="no-posts-icon">📷</div>
        <h2>No posts yet</h2>
      </div>`;
    }

    if (currentUserId === userToView.firebaseId) {
      editBtn.style.display = "inline-block";
      followBtn.style.display = "none";
    } else {
      editBtn.style.display = "none";
      followBtn.style.display = "inline-block";
    }

    if (userToView.followers.some((f) => f._id === data.currentUserMongoId)) {
      followBtn.textContent = "Unfollow";
      followBtn.classList.add("following");
    } else {
      followBtn.textContent = "Follow";
      followBtn.classList.remove("following");
    }

    followBtn.addEventListener("click", async () => {
      try {
        const action =
          followBtn.textContent === "Follow" ? "follow" : "unfollow";
        const res = await fetch(`${API_URL}/${action}/${userToView._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentUserId }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }
        const result = await res.json();
        console.log(result.message);

        if (action === "follow") {
          followBtn.textContent = "Unfollow";
          followBtn.classList.add("following");
          userToView.followers.push({ _id: currentUserId });
        } else {
          followBtn.textContent = "Follow";
          followBtn.classList.remove("following");
          userToView.followers = userToView.followers.filter(
            (f) => f._id !== currentUserId
          );
        }
        followersCountElem.textContent = userToView.followers.length;
      } catch (error) {
        console.error("Follow/unfollow error:", error);
        alert(error.message);
      }
    });

    editBtn.addEventListener("click", async () => {
      const newUsername = prompt("Enter new Username:");
      const newBio = prompt("Enter new Bio:");
      if (!newUsername) return;

      const res = await fetch(`${API_URL}/edit/${currentUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, bio: newBio }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      const updated = await res.json();
      usernameElem.textContent = updated.username;
      bioElem.textContent = updated.bio || "";
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    alert(err.message);
  }
});
