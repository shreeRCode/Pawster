import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDRPUiH8gjikv2XtVSC5v324eNDIEgd-iU",
  authDomain: "pawster-febb6.firebaseapp.com",
  projectId: "pawster-febb6",
  storageBucket: "pawster-febb6.appspot.com",
  messagingSenderId: "539595663996",
  appId: "1:539595663996:web:1336492c9b6378b5ad77f9",
  measurementId: "G-L6QRKFL95B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
