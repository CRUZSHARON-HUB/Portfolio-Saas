import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Navbar from '../components/layout/Navbar.jsx';
import TiltCard from '../components/three/TiltCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { formatNumber } from '../lib/format.js';

export default function Directory() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.public
      .directory()
      .then((result) => setPortfolios(result.portfolios))
      .catch(() => setPortfolios([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Showcase</span>
            <h2>Portfolios built with Prismfolio</h2>
            <p>Live, published sites from the community. Open any of them to see the templates in action.</p>
          </div>

          {loading ? (
            <div className="loader-page">
              <div className="spinner" />
            </div>
          ) : portfolios.length === 0 ? (
            <EmptyState
              icon="◇"
              title="No published portfolios yet"
              message="Be the first — publish a portfolio and it will appear here."
              action={
                <Link className="btn btn-primary" to="/register">
                  Create yours
                </Link>
              }
            />
          ) : (
            <div className="showcase">
              {portfolios.map((portfolio) => (
                <TiltCard key={portfolio.slug} maxTilt={5} className="template-card">
                  <Link to={`/p/${portfolio.slug}`}>
                    <div
                      className="template-preview"
                      style={{
                        background: `radial-gradient(120% 90% at 25% 0%, var(--accent), transparent 62%), #080a14`,
                      }}
                    >
                      <div className="layer float float-2" style={{ top: '18%', left: '10%', width: '46%', height: '28%' }} />
                      <div className="layer float float-3" style={{ top: '18%', right: '10%', width: '30%', height: '46%' }} />
                      <div className="layer float float-4" style={{ top: '54%', left: '10%', width: '70%', height: '28%' }} />
                    </div>
                  </Link>

                  <div className="template-meta" style={{ alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <h4>{portfolio.title}</h4>
                      <p className="faint" style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                        {portfolio.tagline?.slice(0, 70) || 'Published with Prismfolio'}
                      </p>
                      <div className="pf-meta" style={{ marginTop: '0.5rem' }}>
                        <span className="badge">{portfolio.template}</span>
                        <span>{formatNumber(portfolio.views)} views</span>
                      </div>
                    </div>
                    <Link className="btn btn-ghost btn-sm" to={`/p/${portfolio.slug}`}>
                      Open
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
