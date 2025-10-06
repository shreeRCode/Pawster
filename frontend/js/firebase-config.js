// js/firebase-config.js

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRPUiH8gjikv2XtVSC5v324eNDIEgd-iU",
  authDomain: "pawster-febb6.firebaseapp.com",
  projectId: "pawster-febb6",
  storageBucket: "pawster-febb6.appspot.com", // <-- FIXED (was .firebasestorage.app, should be .appspot.com)
  messagingSenderId: "539595663996",
  appId: "1:539595663996:web:1336492c9b6378b5ad77f9",
  measurementId: "G-L6QRKFL95B",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// (Optional) Initialize Analytics
if (typeof firebase.analytics === "function") {
  firebase.analytics();
}
// Initialize Auth and export
const auth = firebase.auth();
window.auth = auth; // attach to window to access in other scripts if not using modules
const db = firebase.firestore();
const storage = firebase.storage();
window.storage = storage;
window.db = db;
console.log("Firebase initialized successfully!");
