import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ParticleField from '../components/three/ParticleField.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'demo@portfoliosaas.dev', password: 'demo1234' });
    setError('');
  };

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <ParticleField className="hero-canvas" density={80} />
        <Link to="/" className="brand" style={{ position: 'relative', zIndex: 2 }}>
          <span className="brand-mark">◈</span>
          <span>
            Prism<span className="gradient-text">folio</span>
          </span>
        </Link>

        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: '1.6rem' }}>
          <p className="auth-quote">
            “I replaced a 14-page PDF with one link. Three recruiter screens later, the interview was booked.”
          </p>
          <div className="row" style={{ gap: '0.8rem' }}>
            <span className="avatar" style={{ '--hue': 268 }}>
              AR
            </span>
            <div>
              <strong style={{ fontSize: '0.92rem' }}>Alex Rivera</strong>
              <p className="faint" style={{ fontSize: '0.8rem' }}>
                Product Engineer · Starter plan
              </p>
            </div>
          </div>
        </div>

        <p className="faint" style={{ fontSize: '0.8rem', position: 'relative', zIndex: 2 }}>
          © {new Date().getFullYear()} Prismfolio
        </p>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h1 style={{ marginTop: '0.7rem' }}>Sign in</h1>
          <p style={{ marginBottom: '1.6rem' }}>Pick up exactly where you left off.</p>

          {error ? <div className="form-error">{error}</div> : null}

          <form onSubmit={submit}>
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@studio.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? <span className="spinner" /> : null}
              {busy ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: '0.7rem' }}
            type="button"
            onClick={fillDemo}
          >
            Use demo credentials
          </button>

          <p style={{ marginTop: '1.6rem', fontSize: '0.9rem', textAlign: 'center' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
