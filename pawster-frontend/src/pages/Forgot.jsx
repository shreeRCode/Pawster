import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../services/auth";

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo">Pawster</h1>
        <p className="auth-subtitle">
          Enter your email to reset your password.
        </p>

        {success && (
          <div className="auth-success">Reset link sent! Check your inbox.</div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleReset}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="auth-btn"
            disabled={loading || success}
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-password">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Forgot;
