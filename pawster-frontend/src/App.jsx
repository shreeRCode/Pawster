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
        {/* Public */}
        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={user ? <Navigate to="/feed" /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/feed" /> : <Register />}
        />

        <Route path="/forgot" element={<Forgot />} />

        {/* Protected */}
        <Route
          path="/feed"
          element={user ? <Feed user={user} /> : <Navigate to="/login" />}
        />

        {/* Own profile - redirects to profile with query param */}
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />

        {/* Other user's profile by username */}
        <Route
          path="/profile/:username"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
