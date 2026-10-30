export default function EmptyState({ icon = '◇', title, message, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3 style={{ fontSize: '1.08rem', marginBottom: '0.4rem' }}>{title}</h3>
      {message ? <p style={{ fontSize: '0.92rem', maxWidth: '44ch', margin: '0 auto 1.2rem' }}>{message}</p> : null}
      {action}
    </div>
  );
}
