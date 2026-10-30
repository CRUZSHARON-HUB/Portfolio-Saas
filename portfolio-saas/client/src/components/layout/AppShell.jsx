import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="shell-layout">
      <aside className="sidebar">
        <NavLink to="/" className="brand" style={{ padding: '0 0.5rem' }}>
          <span className="brand-mark">◈</span>
          <span>
            Prism<span className="gradient-text">folio</span>
          </span>
        </NavLink>

        <div className="side-group">
          <span className="side-label">Workspace</span>
          <NavLink to="/app" end className="side-link">
            <span className="ico">◈</span> Dashboard
          </NavLink>
          <NavLink to="/app/portfolios" className="side-link">
            <span className="ico">▤</span> My portfolios
          </NavLink>
          <NavLink to="/app/analytics" className="side-link">
            <span className="ico">◷</span> Analytics
          </NavLink>
          <NavLink to="/app/settings" className="side-link">
            <span className="ico">⚙</span> Settings
          </NavLink>
        </div>

        <div className="side-group">
          <span className="side-label">Discover</span>
          <NavLink to="/directory" className="side-link">
            <span className="ico">◇</span> Showcase
          </NavLink>
          <NavLink to="/pricing" className="side-link">
            <span className="ico">◇</span> Plans
          </NavLink>
        </div>

        <div className="side-foot">
          <div className="plan-card">
            <div className="spread" style={{ marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem' }}>{user?.plan ?? 'free'}</strong>
              <span className="badge badge-accent" style={{ fontSize: '0.66rem' }}>
                {user?.plan === 'free' ? 'Trial' : 'Active'}
              </span>
            </div>
            <p className="faint" style={{ fontSize: '0.78rem' }}>
              {user?.email}
            </p>
          </div>
          <button className="side-link" style={{ width: '100%', marginTop: '0.6rem' }} onClick={handleLogout}>
            <span className="ico">↩</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export function UserChip({ name = '', hue = 210, size = '' }) {
  return (
    <span className={`avatar ${size}`} style={{ '--hue': hue }}>
      {initials(name)}
    </span>
  );
}
