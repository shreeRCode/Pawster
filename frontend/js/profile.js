import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API_URL = "http://localhost:5000/api/users";

const usernameElem = document.querySelector(".profile-username");
const bioElem = document.querySelector(".bio-text");
const editBtn = document.querySelector(".edit-profile-btn");
const postsGrid = document.getElementById("postsGrid");
const followBtn = document.getElementById("followBtn");
const followersCountElem = document.querySelectorAll(".stat-number")[1];
const postsCountElem = document.querySelectorAll(".stat-number")[0];

//Get profile UID from URL

const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get("uid");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const currentUserId = user.uid;
  const token = await user.getIdToken();
  //fetch profile data
  const res = await fetch(`${API_URL}/${profileUserId || user.uid}`);
  const data = await res.json();
  const userToView = data.user;
  const posts = data.posts;
  //set username,bio,posts
  usernameElem.textContent = userToView.username;
  bioElem.textContent = userToView.bio || "No bio yet";
  postsCountElem.textContent = posts.length;
  followersCountElem.textContent = userToView.followers.length;

  //show posts
  postsGrid.innerHTML = "";
  if (posts.length > 0) {
    posts.forEach((post) => {
      const img = document.createElement("img");
      img.src = post.imageUrl;
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
  if (userToView.followers.some((f) => f._id === currentUserId)) {
    followBtn.textContent = "Unfollow";
    followBtn.classList.add("following");
  } else {
    followBtn.textContent = "Follow";
    followBtn.classList.remove("following");
  }
  //follow/unfollow click handler
  followBtn.addEventListener("click",async()=>{
    try{
      const action = followBtn.textContent==="Follow"?"follow":"unfollow";
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_URL}/${action}/${userToView._id}`,{
        method: "POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify({currentUserId})
      });
      if(!res.ok){
        const err= await res.json();
        throw new Error(err.message || "Request failed");
      }
    }
  })
});
