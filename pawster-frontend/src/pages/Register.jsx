import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const syncUserToBackend = async (
    firebaseUser,
    customUsername,
    customDisplayName,
  ) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username:
            customUsername ||
            firebaseUser.email.split("@")[0] + "_" + Date.now(),
          displayName: customDisplayName || firebaseUser.displayName,
          name: customDisplayName || firebaseUser.displayName,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user to backend");
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing user:", error);
      // Don't block registration if backend sync fails
    }
  };

  // =============================
  // Email + Password Signup
  // =============================
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUser = userCredential.user;

      // Sync to backend
      await syncUserToBackend(firebaseUser, username, fullname);

      // Send verification email
      await sendEmailVerification(firebaseUser);

      alert(
        "Signup successful! A verification email has been sent. Please verify before logging in.",
      );

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed: " + error.message);
      setLoading(false);
    }
  };

  // =============================
  // Google Signup
  // =============================
  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const generatedUsername =
        firebaseUser.email.split("@")[0] + "_" + Date.now();

      // Sync to backend
      await syncUserToBackend(
        firebaseUser,
        generatedUsername,
        firebaseUser.displayName,
      );

      // Navigate to feed - App.jsx will handle this via onAuthStateChanged
      navigate("/feed", { replace: true });
    } catch (error) {
      console.error("Google Sign-Up error:", error);

      // Check if it's a popup closed error
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, just reset loading state
        setLoading(false);
        return;
      }

      alert("Google Sign-Up failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">Pawster</h1>
        <p className="auth-subtitle">
          Sign up to see photos and videos from your friends.
        </p>

        {/* Google Signup */}
        <button
          type="button"
          className="google-sign-in-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Continue with Google"}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Email Signup Form */}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </div>

      <div className="auth-box signup-link">
        <p>
          Have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
