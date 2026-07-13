import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { logoutUser } from "../services/auth";

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/", { replace: true });
  };

  const initial = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/feed" className="nav-logo">
          <h2>Pawster</h2>
        </Link>

        <nav className="nav-icons">
          <Link to="/feed" className="nav-icon" title="Home" aria-label="Home">
            <Home size={24} strokeWidth={2} />
          </Link>
          <Link
            to="/profile"
            className="nav-icon"
            title="Profile"
            aria-label="Profile"
          >
            <div className="nav-profile">{initial}</div>
          </Link>
          <button
            onClick={handleLogout}
            className="nav-icon logout-btn"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={24} strokeWidth={2} />
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
