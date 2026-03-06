import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../services/auth";
import { syncUser } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullname: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const firebaseUser = await registerUser(form.email, form.password);
      await syncUser(firebaseUser, {
        username: form.username,
        displayName: form.fullname,
        name: form.fullname,
      });
      navigate("/login", { replace: true });
      // A toast would be better here; keeping it simple for now
      alert("Account created! Please verify your email before logging in.");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const firebaseUser = await loginWithGoogle();
      await syncUser(firebaseUser);
      navigate("/feed", { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-up failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">Pawster</h1>
        <p className="auth-subtitle">
          Sign up to share pet moments with the world.
        </p>

        <button
          type="button"
          className="google-sign-in-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? "Signing up…" : "Continue with Google"}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={update("email")}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullname}
              onChange={update("fullname")}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={update("username")}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={update("password")}
              required
              disabled={loading}
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
      </div>

      <div className="auth-box signup-link">
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
