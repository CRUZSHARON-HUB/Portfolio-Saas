import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CubeScene from '../components/three/CubeScene.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', headline: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        headline: form.headline.trim(),
        password: form.password,
      });
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Link to="/" className="brand" style={{ position: 'relative', zIndex: 2 }}>
          <span className="brand-mark">◈</span>
          <span>
            Prism<span className="gradient-text">folio</span>
          </span>
        </Link>

        <div className="scene" style={{ position: 'relative', zIndex: 2, display: 'grid', placeItems: 'center' }}>
          <CubeScene />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <p className="auth-quote">Spin up a portfolio in minutes. Publish it on your own URL.</p>
          <div className="row" style={{ gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success">Free forever tier</span>
            <span className="badge">No credit card</span>
          </div>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Get started</span>
          <h1 style={{ marginTop: '0.7rem' }}>Create your account</h1>
          <p style={{ marginBottom: '1.6rem' }}>A default portfolio is created for you automatically.</p>

          {error ? <div className="form-error">{error}</div> : null}

          <form onSubmit={submit}>
            <div className="field">
              <label className="label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className="input"
                placeholder="Alex Rivera"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
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
              <label className="label" htmlFor="headline">
                Headline <span className="faint">(optional)</span>
              </label>
              <input
                id="headline"
                className="input"
                placeholder="Product-minded Full-Stack Engineer"
                value={form.headline}
                onChange={(event) => setForm({ ...form, headline: event.target.value })}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                minLength={8}
                required
              />
              <span className="field-hint">Minimum 8 characters.</span>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? <span className="spinner" /> : null}
              {busy ? 'Creating account' : 'Create free account'}
            </button>
          </form>

          <p style={{ marginTop: '1.6rem', fontSize: '0.9rem', textAlign: 'center' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
