import { useEffect } from 'react';

export default function Modal({ title, open, onClose, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="spread" style={{ marginBottom: '1.3rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        {children}
        {footer ? (
          <div className="row" style={{ justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.4rem' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
