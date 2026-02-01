import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const BASE_API_URL = "https://pawster-pi.vercel.app";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const syncUserToBackend = async (firebaseUser) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.email.split("@")[0] + "_" + Date.now(),
          displayName:
            firebaseUser.displayName || firebaseUser.email.split("@")[0],
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user to backend");
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing user:", error);
      // Don't block login if backend sync fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        alert("Please verify your email first.");
        setLoading(false);
        return;
      }

      // Sync to backend
      await syncUserToBackend(firebaseUser);

      // Navigate to feed - the App.jsx will handle this via onAuthStateChanged
      // but we call it explicitly for immediate feedback
      navigate("/feed", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Sync to backend
      await syncUserToBackend(firebaseUser);
    } catch (error) {
      console.error("Google Sign-In error:", error);

      // Check if it's a popup closed error
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, just reset loading state
        setLoading(false);
        return;
      }

      alert("Google Sign-In failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">Pawster</h1>

        <form className="auth-form" onSubmit={handleLogin}>
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-sign-in-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="forgot-password">
          <Link to="/forgot">Forgot Password?</Link>
        </div>
      </div>

      <div className="auth-box signup-link">
        <p>
          Don't have an account?
          <Link to="/register"> Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
