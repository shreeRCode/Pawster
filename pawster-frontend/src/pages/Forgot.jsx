import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";

function Forgot() {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Check your email.");
      setEmail("");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password</h2>

        <form onSubmit={handleReset}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Send Reset Link
          </button>
        </form>

        <div className="forgot-password">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Forgot;
