import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/ui/Loader.jsx';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({ fullName: '', headline: '', avatarHue: 210 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await api.auth.me();
      setForm({
        fullName: result.user.fullName,
        headline: result.user.headline,
        avatarHue: result.user.avatarHue ?? 210,
      });
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await api.auth.updateMe(form);
      setUser(result.user);
      push('Profile updated');
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading profile" />;

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">Settings</span>
          <h1 style={{ marginTop: '0.6rem' }}>Your profile</h1>
          <p>This information appears in the dashboard and on your published portfolios.</p>
        </div>
      </header>

      <div className="dash-grid">
        <form className="card card-pad-lg" onSubmit={save}>
          <div className="field">
            <label className="label" htmlFor="set-name">
              Full name
            </label>
            <input
              id="set-name"
              className="input"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="set-headline">
              Headline
            </label>
            <input
              id="set-headline"
              className="input"
              placeholder="Product-minded Full-Stack Engineer"
              value={form.headline}
              onChange={(event) => setForm({ ...form, headline: event.target.value })}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="set-email">
              Email
            </label>
            <input id="set-email" className="input" value={user?.email ?? ''} disabled />
            <span className="field-hint">Contact support to change your sign-in email.</span>
          </div>

          <div className="field">
            <label className="label" htmlFor="set-hue">
              Avatar colour
            </label>
            <div className="row" style={{ gap: '0.9rem' }}>
              <span className="avatar avatar-lg" style={{ '--hue': form.avatarHue }}>
                {form.fullName.slice(0, 2).toUpperCase()}
              </span>
              <input
                id="set-hue"
                type="range"
                min={0}
                max={359}
                value={form.avatarHue}
                onChange={(event) => setForm({ ...form, avatarHue: Number(event.target.value) })}
                style={{ flex: 1, accentColor: 'var(--accent)' }}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : null}
            {saving ? 'Saving' : 'Save profile'}
          </button>
        </form>

        <section className="card card-pad-lg">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Current plan</h3>
          <div className="spread" style={{ marginBottom: '0.8rem' }}>
            <strong style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>{user?.plan}</strong>
            <span className="badge badge-accent">Active</span>
          </div>
          <p style={{ fontSize: '0.92rem' }}>
            You are on the {user?.plan} tier. Upgrade any time from the pricing page to unlock more portfolios,
            more projects and traffic analytics.
          </p>
          <a className="btn btn-ghost btn-block" href="/pricing" style={{ marginTop: '1.2rem' }}>
            Compare plans
          </a>
        </section>
      </div>
    </>
  );
}
