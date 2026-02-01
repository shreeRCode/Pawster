import React from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import "../styles/layout.css";

function Navbar({ user }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>Pawster</h2>
        </Link>

        <nav className="nav-icons">
          <Link to="/" className="nav-icon" title="Home">
            🏠
          </Link>
          <Link to="/profile" className="nav-icon" title="Profile">
            👤
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="nav-icon logout-btn"
              title="Logout"
            >
              🚪
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
