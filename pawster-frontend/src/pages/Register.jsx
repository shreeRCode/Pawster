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

  const navigate = useNavigate();

  // =============================
  // Email + Password Signup
  // =============================
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUser = userCredential.user;

      // 🔥 Sync Mongo user
      await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username: username,
          displayName: fullname,
          name: fullname,
        }),
      });

      await sendEmailVerification(firebaseUser);

      alert(
        "Signup successful! A verification email has been sent. Please verify before logging in.",
      );

      navigate("/login");
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  };

  // =============================
  // Google Signup
  // =============================
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const generatedUsername =
        firebaseUser.email.split("@")[0] + "_" + Date.now();

      await fetch(`${BASE_API_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          username: generatedUsername,
          displayName: firebaseUser.displayName,
          name: firebaseUser.displayName,
        }),
      });

      navigate("/");
    } catch (error) {
      alert("Google Sign-Up failed: " + error.message);
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
        >
          Continue with Google
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
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            Sign up
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
