import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import TiltCard from '../components/three/TiltCard.jsx';
import Icon from '../components/ui/Icon.jsx';

const THUMB_GRADIENTS = {
  nebula: 'linear-gradient(140deg,#8b5cf6,#22d3ee)',
  prism: 'linear-gradient(140deg,#f472b6,#fbbf24)',
  atlas: 'linear-gradient(140deg,#34d399,#22d3ee)',
  monolith: 'linear-gradient(140deg,#64748b,#a78bfa)',
};

export default function Portfolios() {
  const { push } = useToast();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader label="Loading portfolios" />;

  const atLimit = portfolios.length >= (plan?.max_portfolios ?? 1);

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">Library</span>
          <h1 style={{ marginTop: '0.6rem' }}>My portfolios</h1>
          <p>
            {portfolios.length} of {plan?.max_portfolios ?? 1} slots used on the {plan?.name ?? 'free'} plan.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/app')}
          disabled={atLimit}
          title={atLimit ? 'Upgrade to add more portfolios' : 'Create a new portfolio'}
        >
          + New portfolio
        </button>
      </header>

      {portfolios.length === 0 ? (
        <EmptyState
          icon="◈"
          title="Nothing here yet"
          message="Create your first portfolio from the dashboard to get started."
          action={
            <Link className="btn btn-primary" to="/app">
              Open dashboard
            </Link>
          }
        />
      ) : (
        <div className="showcase">
          {portfolios.map((portfolio) => (
            <TiltCard key={portfolio.id} maxTilt={5} className="template-card">
              <div
                className="template-preview"
                style={{
                  background: `radial-gradient(120% 90% at 20% 0%, ${
                    THUMB_GRADIENTS[portfolio.template] ?? THUMB_GRADIENTS.nebula
                  }, transparent 65%), #080a14`,
                }}
              >
                <div
                  className="layer float float-2"
                  style={{ top: '16%', left: '9%', width: '44%', height: '30%' }}
                />
                <div
                  className="layer float float-3"
                  style={{ top: '16%', right: '9%', width: '32%', height: '48%' }}
                />
                <div
                  className="layer float float-4"
                  style={{ top: '54%', left: '9%', width: '74%', height: '30%' }}
                />
              </div>

              <div style={{ padding: '1.05rem 1.25rem 1.25rem' }}>
                <div className="spread" style={{ marginBottom: '0.35rem' }}>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 650 }}>{portfolio.title}</h4>
                  {portfolio.published ? (
                    <span className="badge badge-success" style={{ fontSize: '0.66rem' }}>
                      <span className="dot" /> Live
                    </span>
                  ) : (
                    <span className="badge" style={{ fontSize: '0.66rem' }}>
                      Draft
                    </span>
                  )}
                </div>

                <p className="mono faint" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  /p/{portfolio.slug}
                </p>

                <div className="pf-meta" style={{ marginBottom: '0.9rem' }}>
                  <span>{portfolio.projectCount} projects</span>
                  <span>·</span>
                  <span>{portfolio.skillCount} skills</span>
                  <span>·</span>
                  <span>{portfolio.views} views</span>
                </div>

                <div className="row" style={{ gap: '0.45rem', flexWrap: 'wrap' }}>
                  <Link className="btn btn-primary btn-sm" to={`/app/portfolio/${portfolio.id}`}>
                    Edit
                  </Link>
                  <Link className="btn btn-ghost btn-sm" to={`/p/${portfolio.slug}`} target="_blank" rel="noreferrer">
                    Preview
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
    </>
  );
}
