import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/ui/Loader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { formatDate, formatNumber, formatShortDate } from '../lib/format.js';

export default function Analytics() {
  const { push } = useToast();
  const [params, setParams] = useSearchParams();
  const [portfolios, setPortfolios] = useState([]);
  const [data, setData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('traffic');

  const selectedId = params.get('id');

  const loadPortfolios = useCallback(async () => {
    try {
      const result = await api.portfolios.list();
      setPortfolios(result.portfolios);
      if (!selectedId && result.portfolios.length > 0) {
        setParams({ id: String(result.portfolios[0].id) });
      }
    } catch (error) {
      push(error.message, 'error');
    }
  }, [selectedId, setParams, push]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const loadData = useCallback(async () => {
    if (!selectedId) {
      setLoading(false);
      return;
    }
    try {
      const [analytics, inbox] = await Promise.all([
        api.analytics.get(selectedId),
        api.analytics.inquiries(selectedId),
      ]);
      setData(analytics);
      setInquiries(inbox.inquiries);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedId, push]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chart = useMemo(() => {
    if (!data?.daily?.length) return [];
    const max = Math.max(...data.daily.map((point) => point.views), 1);
    return data.daily.map((point) => ({
      ...point,
      percent: Math.max(3, (point.views / max) * 100),
    }));
  }, [data]);

  if (loading) return <Loader label="Crunching analytics" />;

  if (portfolios.length === 0) {
    return (
      <EmptyState
        icon="◷"
        title="No portfolios to measure"
        message="Publish a portfolio and its traffic data will appear here."
        action={
          <Link className="btn btn-primary" to="/app">
            Go to dashboard
          </Link>
        }
      />
    );
  }

  const selected = portfolios.find((item) => String(item.id) === String(selectedId));

  return (
    <>
      <header className="page-head">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1 style={{ marginTop: '0.6rem' }}>{selected?.title ?? 'Traffic'}</h1>
          <p>
            {data?.published ? 'Published' : 'Draft'} · <span className="mono">/p/{data?.slug}</span>
          </p>
        </div>
        <select
          className="select"
          style={{ width: 'auto', minWidth: '230px' }}
          value={selectedId ?? ''}
          onChange={(event) => setParams({ id: event.target.value })}
        >
          {portfolios.map((portfolio) => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.title}
            </option>
          ))}
        </select>
      </header>

      <div className="stat-grid">
        <StatCard label="Total views" value={formatNumber(data?.totals.totalViews ?? 0)} delta="All time" accent />
        <StatCard label="Last 7 days" value={formatNumber(data?.totals.views7d ?? 0)} />
        <StatCard label="Last 30 days" value={formatNumber(data?.totals.views30d ?? 0)} />
        <StatCard label="Inquiries" value={formatNumber(data?.totals.inquiries ?? 0)} delta="Contact form messages" />
      </div>

      <div className="tabs">
        {[
          { id: 'traffic', label: 'Traffic' },
          { id: 'sources', label: 'Sources' },
          { id: 'inbox', label: `Inbox (${inquiries.length})` },
        ].map((item) => (
          <button key={item.id} className={`tab ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'traffic' ? (
        <div className="analytics-grid">
          <section className="card card-pad-lg">
            <div className="spread" style={{ marginBottom: '1.4rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Views — last 30 days</h3>
              <span className="badge">{formatNumber(data?.totals.views30d ?? 0)} views</span>
            </div>

            {chart.length === 0 ? (
              <EmptyState icon="◷" title="No traffic yet" message="Share your published URL to start collecting views." />
            ) : (
              <div className="bars">
                {chart.map((point) => (
                  <div className="bar-col" key={point.day} title={`${point.day}: ${point.views} views`}>
                    <div className="bar" style={{ height: `${point.percent}%` }} />
                    <span className="bar-tip">{formatShortDate(point.day)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card-pad-lg">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent visits</h3>
            {data?.recentViews?.length ? (
              <div className="stack">
                {data.recentViews.map((view, index) => (
                  <div className="rank-row" key={`${view.viewed_at}-${index}`}>
                    <span className="rank-num">{view.device.slice(0, 2).toUpperCase()}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem' }}>{view.referrer || 'Direct visit'}</div>
                      <div className="faint" style={{ fontSize: '0.76rem' }}>
                        {view.path} · {formatDate(view.viewed_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="faint" style={{ fontSize: '0.9rem' }}>
                No visits recorded yet.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'sources' ? (
        <div className="analytics-grid">
          <section className="card card-pad-lg">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Top referrers</h3>
            {data?.referrers?.length ? (
              <div className="stack">
                {data.referrers.map((row, index) => (
                  <div className="rank-row" key={row.source}>
                    <span className="rank-num">{index + 1}</span>
                    <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.source}
                    </span>
                    <span className="rank-value">{row.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="faint" style={{ fontSize: '0.9rem' }}>
                No referrer data yet.
              </p>
            )}
          </section>

          <section className="card card-pad-lg">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Devices</h3>
            {data?.devices?.length ? (
              <div className="stack">
                {data.devices.map((row) => (
                  <div className="rank-row" key={row.device}>
                    <span className="rank-num">{row.device.slice(0, 2).toUpperCase()}</span>
                    <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{row.device}</span>
                    <span className="rank-value">{row.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="faint" style={{ fontSize: '0.9rem' }}>
                No device data yet.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'inbox' ? (
        <section className="card card-pad-lg">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Contact messages</h3>
          {inquiries.length === 0 ? (
            <EmptyState icon="✉" title="Inbox is empty" message="Messages sent through your public page will land here." />
          ) : (
            <div className="stack" style={{ gap: '0.8rem' }}>
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="card"
                  style={{
                    padding: '1.1rem 1.2rem',
                    borderColor: inquiry.isRead ? 'var(--line)' : 'var(--accent-soft)',
                  }}
                >
                  <div className="spread" style={{ marginBottom: '0.4rem' }}>
                    <div className="row" style={{ gap: '0.6rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{inquiry.name}</strong>
                      <a href={`mailto:${inquiry.email}`} style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                        {inquiry.email}
                      </a>
                    </div>
                    <span className="faint" style={{ fontSize: '0.78rem' }}>
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-dim)' }}>{inquiry.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
