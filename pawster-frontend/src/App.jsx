import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";

import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Forgot from "./pages/Forgot";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Show Navbar only if logged in */}
      {user && <Navbar user={user} />}

      <Routes>
        {/* Landing page - redirect to feed if logged in */}
        <Route
          path="/"
          element={user ? <Navigate to="/feed" replace /> : <Landing />}
        />

        {/* Auth routes - redirect to feed if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/feed" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/feed" replace /> : <Register />}
        />

        <Route path="/forgot" element={<Forgot />} />

        {/* Protected routes */}
        <Route
          path="/feed"
          element={
            user ? <Feed user={user} /> : <Navigate to="/login" replace />
          }
        />

        {/* Own profile - redirects to profile with query param */}
        <Route
          path="/profile"
          element={
            user ? <Profile user={user} /> : <Navigate to="/login" replace />
          }
        />

        {/* Other user's profile by username */}
        <Route
          path="/profile/:username"
          element={
            user ? <Profile user={user} /> : <Navigate to="/login" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
