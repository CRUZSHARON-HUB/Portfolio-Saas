import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Icon from '../components/ui/Icon.jsx';
import TiltCard from '../components/three/TiltCard.jsx';
import { TEMPLATE_OPTIONS } from '../lib/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [portfolios, setPortfolios] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: '', template: 'nebula' });

  const load = useCallback(async () => {
    try {
      const result = await api.portfolios.list();
      setPortfolios(result.portfolios);
      setPlan(result.plan);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const views = portfolios.reduce((sum, item) => sum + item.views, 0);
    const projects = portfolios.reduce((sum, item) => sum + item.projectCount, 0);
    const published = portfolios.filter((item) => item.published).length;
    return { views, projects, published };
  }, [portfolios]);

  const createPortfolio = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api.portfolios.create(form);
      push('Portfolio created');
      setCreateOpen(false);
      setForm({ title: '', template: 'nebula' });
      navigate(`/app/portfolio/${result.portfolio.id}`);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (portfolio) => {
    try {
      await api.portfolios.publish(portfolio.id, !portfolio.published);
      push(portfolio.published ? 'Portfolio unpublished' : 'Portfolio is live');
      load();
    } catch (error) {
      push(error.message, 'error');
    }
  };

  const removePortfolio = async (portfolio) => {
    if (!window.confirm(`Delete "${portfolio.title}"? This cannot be undone.`)) return;
    try {
      await api.portfolios.remove(portfolio.id);
      push('Portfolio deleted');
      load();
    } catch (error) {
      push(error.message, 'error');
    }
  };

  if (loading) return <Loader label="Loading your workspace" />;

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 style={{ marginTop: '0.6rem' }}>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p>Manage your portfolios, publish them, and keep an eye on who is visiting.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          + New portfolio
        </button>
      </header>

      <div className="stat-grid">
        <StatCard label="Portfolios" value={portfolios.length} delta={`${stats.published} published`} accent />
        <StatCard label="Total views" value={stats.views} delta="Across all portfolios" />
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Plan" value={(plan?.name ?? 'free').toUpperCase()} delta={`${plan?.max_portfolios ?? 1} portfolio slots`} />
      </div>

      <div className="dash-grid">
        <section className="card card-pad-lg">
          <div className="spread" style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Your portfolios</h3>
            <Link to="/app/portfolios" className="btn btn-ghost btn-sm">
              Manage all
            </Link>
          </div>

          {portfolios.length === 0 ? (
            <EmptyState
              icon="◈"
              title="No portfolios yet"
              message="Create your first portfolio to get a shareable URL and start collecting views."
              action={
                <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                  Create portfolio
                </button>
              }
            />
          ) : (
            <div className="stack" style={{ gap: '0.7rem' }}>
              {portfolios.map((portfolio) => (
                <TiltCard key={portfolio.id} maxTilt={2.5} depth={12}>
                  <div className="pf-card">
                    <div className="pf-thumb" style={{ '--accent': 'var(--accent)' }}>
                      {portfolio.title.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="grow" style={{ minWidth: 0 }}>
                      <h4>{portfolio.title}</h4>
                      <div className="pf-meta">
                        <span className="mono">/p/{portfolio.slug}</span>
                        <span>·</span>
                        <span>{portfolio.projectCount} projects</span>
                        <span>·</span>
                        <span>{portfolio.views} views</span>
                        {portfolio.published ? (
                          <span className="badge badge-success" style={{ padding: '0.1rem 0.5rem' }}>
                            <span className="dot" /> Live
                          </span>
                        ) : (
                          <span className="badge" style={{ padding: '0.1rem 0.5rem' }}>
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pf-actions">
                      <Link className="btn btn-ghost btn-sm" to={`/app/portfolio/${portfolio.id}`}>
                        Edit
                      </Link>
                      <Link className="btn btn-ghost btn-sm" to={`/p/${portfolio.slug}`} target="_blank" rel="noreferrer">
                        View
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(portfolio)}>
                        {portfolio.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="icon-btn danger" onClick={() => removePortfolio(portfolio)} aria-label="Delete">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </section>

        <section className="card card-pad-lg">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Quick start</h3>
          <ol className="stack" style={{ gap: '0.95rem', counterReset: 'step' }}>
            {[
              { title: 'Pick a template', body: 'Nebula, Prism, Atlas or Monolith — switch any time.', to: '/app/portfolios' },
              { title: 'Fill in your details', body: 'Headline, about, contact links and socials.', to: '/app/portfolios' },
              { title: 'Add your work', body: 'Projects, tech stacks, skills and job history.', to: '/app/portfolios' },
              { title: 'Publish it', body: 'One toggle and your URL goes live.', to: '/app/analytics' },
            ].map((step, index) => (
              <li key={step.title} className="row" style={{ gap: '0.85rem', alignItems: 'flex-start' }}>
                <span className="rank-num">{index + 1}</span>
                <div className="grow">
                  <strong style={{ fontSize: '0.94rem' }}>{step.title}</strong>
                  <p style={{ fontSize: '0.85rem' }}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <hr className="hairline" style={{ margin: '1.4rem 0' }} />

          <div className="row" style={{ gap: '0.8rem' }}>
            <span className="avatar" style={{ '--hue': user?.avatarHue ?? 210 }}>
              {user?.fullName?.slice(0, 1).toUpperCase()}
            </span>
            <div className="grow">
              <strong style={{ fontSize: '0.92rem' }}>{user?.fullName}</strong>
              <p className="faint" style={{ fontSize: '0.8rem' }}>
                {user?.headline || 'Add a headline in settings'}
              </p>
            </div>
            <Link className="btn btn-ghost btn-sm" to="/app/settings">
              Edit
            </Link>
          </div>
        </section>
      </div>

      <Modal
        title="Create a portfolio"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={createPortfolio} disabled={busy}>
              {busy ? <span className="spinner" /> : null}
              Create
            </button>
          </>
        }
      >
        <form onSubmit={createPortfolio}>
          <div className="field">
            <label className="label" htmlFor="pf-title">
              Portfolio title
            </label>
            <input
              id="pf-title"
              className="input"
              placeholder="Alex Rivera — Product Engineer"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              autoFocus
            />
          </div>

          <div className="field">
            <span className="label">Template</span>
            <div className="picker-grid">
              {TEMPLATE_OPTIONS.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={`picker ${form.template === template.id ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, template: template.id })}
                >
                  <strong style={{ display: 'block' }}>{template.label}</strong>
                  <span className="faint" style={{ fontSize: '0.76rem' }}>
                    {template.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="sr-only">
            Create
          </button>
        </form>
      </Modal>
    </>
  );
}
