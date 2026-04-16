import { useEffect } from 'react';
import { formatDate } from '../utils/formatDate';
import CommentSection from './CommentSection';

const CATEGORY_COLORS = {
  Tech: '#3b82f6',
  Sports: '#10b981',
  Academic: '#8b5cf6',
  Social: '#ec4899',
};

function EventModal({ event, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const catColor = CATEGORY_COLORS[event.category] || '#6366f1';

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        <div style={{ ...styles.colorBar, backgroundColor: catColor }} />
        <button style={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={styles.content}>
          <span style={{ ...styles.badge, backgroundColor: catColor }}>
            {event.category}
          </span>
          <h2 style={styles.title}>{event.title}</h2>

          <div style={styles.dateRow}>
            <svg style={styles.calIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={styles.date}>{formatDate(event.date)}</span>
          </div>

          {event.description && (
            <p style={styles.description}>{event.description}</p>
          )}

          <hr style={styles.divider} />

          <CommentSection eventId={event.id} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modal: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '20px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  colorBar: {
    height: '6px',
    borderRadius: '20px 20px 0 0',
  },
  content: {
    padding: '32px',
  },
  closeButton: {
    position: 'absolute',
    top: '18px',
    right: '18px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#475569',
    transition: 'background 0.15s ease',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.3,
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  calIcon: {
    width: '18px',
    height: '18px',
    color: '#94a3b8',
  },
  date: {
    fontSize: '0.95rem',
    color: '#64748b',
    fontWeight: 500,
  },
  description: {
    margin: '0 0 8px 0',
    lineHeight: 1.7,
    color: '#334155',
    fontSize: '0.95rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '24px 0',
  },
};

export default EventModal;
