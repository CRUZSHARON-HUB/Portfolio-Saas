export function Loader({ label = 'Loading' }) {
  return (
    <div className="loader-page">
      <div className="spinner" />
      <p className="faint" style={{ fontSize: '0.9rem' }}>
        {label}…
      </p>
    </div>
  );
}

export function InlineLoader({ label = 'Working' }) {
  return (
    <span className="row" style={{ gap: '0.55rem' }}>
      <span className="spinner" />
      <span className="faint" style={{ fontSize: '0.86rem' }}>
        {label}…
      </span>
    </span>
  );
}

export default Loader;
