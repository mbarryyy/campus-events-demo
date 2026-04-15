import { formatDate } from '../utils/formatDate';

const CATEGORY_COLORS = {
  Tech: '#3b82f6',
  Sports: '#10b981',
  Academic: '#8b5cf6',
  Social: '#ec4899',
};

function EventCard({ event, onClick }) {
  const catColor = CATEGORY_COLORS[event.category] || '#6366f1';

  return (
    <div
      style={{ ...styles.card, borderTop: `4px solid ${catColor}` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
      }}
    >
      <div style={styles.topRow}>
        <span style={{ ...styles.badge, backgroundColor: catColor }}>
          {event.category}
        </span>
      </div>

      <h3 style={styles.title}>{event.title}</h3>

      {event.description && (
        <p style={styles.description}>{event.description}</p>
      )}

      <div style={styles.dateRow}>
        <svg style={styles.calIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={styles.date}>{formatDate(event.date)}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.3,
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: 'auto',
  },
  calIcon: {
    width: '16px',
    height: '16px',
    color: '#94a3b8',
  },
  date: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
  },
};

export default EventCard;
