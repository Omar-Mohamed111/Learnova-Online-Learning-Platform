import { GraduationCap, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useTheme } from "./ThemeProvider";
import { useAuth } from "../features/auth/AuthProvider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <GraduationCap size={22} />
          </span>

          <span>
            learnova<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>
            Home
          </NavLink>

          <NavLink
            to="/courses"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            Explore courses
          </NavLink>

          {user && (
            <>
              <NavLink
                to={user.role === "teacher" ? "/teacher" : user.role === "admin" ? "/admin" : "/dashboard"}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {user.role === "teacher" ? "Teaching" : user.role === "admin" ? "Admin" : "My learning"}
              </NavLink>

              <NavLink
                to="/profile"
                className={navClass}
                onClick={() => setOpen(false)}
              >
                Profile
              </NavLink>
            </>
          )}

          <div className="mobile-actions">
            {user ? (
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <Link
                className="btn btn-ghost"
                to="/login"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}

            {!user && (
              <Link
                className="btn btn-primary"
                to="/register"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <>
              <button
                className="avatar"
                title="My Profile"
                onClick={() => navigate("/profile")}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>

              <button
                className="btn btn-ghost desktop-only"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost desktop-only" to="/login">
                Log in
              </Link>

              <Link className="btn btn-primary desktop-only" to="/register">
                Get started <span>↗</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="menu-btn"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
