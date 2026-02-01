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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

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
        return;
      }

      await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.email.split("@")[0],
          displayName: firebaseUser.displayName,
          name: firebaseUser.displayName,
        }),
      });

      navigate("/");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.email.split("@")[0] + "_" + Date.now(),
          displayName: firebaseUser.displayName,
          name: firebaseUser.displayName,
        }),
      });

      navigate("/");
    } catch (error) {
      alert("Google Sign-In failed: " + error.message);
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
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-sign-in-button"
          onClick={handleGoogleLogin}
        >
          Continue with Google
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
