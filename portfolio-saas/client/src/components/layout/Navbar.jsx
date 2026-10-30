import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">◈</span>
          <span>
            Prism<span className="gradient-text">folio</span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/features" onClick={() => setOpen(false)}>
            Features
          </NavLink>
          <NavLink to="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </NavLink>
          <NavLink to="/directory" onClick={() => setOpen(false)}>
            Showcase
          </NavLink>

          {user ? (
            <>
              <Link to="/app" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
