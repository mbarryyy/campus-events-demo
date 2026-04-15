import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

function Header({ searchQuery, onSearchChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-brand" onClick={closeMenu}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h1 className="header-title">CampusEvents</h1>
        </Link>

        <div className="header-search">
          <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="header-search-input"
          />
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <nav className={`header-nav${menuOpen ? ' header-nav--open' : ''}`}>
          {user ? (
            <>
              <Link to="/my-events" className="header-nav-link" onClick={closeMenu}>My Events</Link>
              <Link to="/bookmarks" className="header-nav-link" onClick={closeMenu}>Bookmarks</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="header-admin-badge" onClick={closeMenu}>Admin</Link>
              )}
              <NotificationBell />
              <Link to="/profile" className="header-nav-link" onClick={closeMenu}>{user.displayName}</Link>
              <button onClick={handleLogout} className="header-logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-login-btn" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="header-register-btn" onClick={closeMenu}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
