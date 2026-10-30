export default function StatCard({ label, value, delta, accent = false, children }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: 'var(--accent)' } : undefined}>
        {value}
      </div>
      {delta ? <div className={`stat-delta ${delta.startsWith('+') ? 'up' : ''}`}>{delta}</div> : null}
      {children}
    </div>
  );
}
