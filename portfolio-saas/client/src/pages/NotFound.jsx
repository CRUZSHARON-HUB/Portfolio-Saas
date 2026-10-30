import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="shell" style={{ padding: '7rem 0', textAlign: 'center' }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: '3.2rem', margin: '1rem 0 0.6rem' }}>Lost in the void</h1>
      <p style={{ marginBottom: '1.8rem' }}>That page does not exist — or it was never published.</p>
      <div className="row" style={{ justifyContent: 'center', gap: '0.7rem' }}>
        <Link className="btn btn-primary" to="/">
          Back home
        </Link>
        <Link className="btn btn-ghost" to="/directory">
          Browse showcase
        </Link>
      </div>
    </div>
  );
}
