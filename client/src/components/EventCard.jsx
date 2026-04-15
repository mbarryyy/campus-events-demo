import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import CapacityBar from './CapacityBar';

const CATEGORY_COLORS = {
  Tech: '#3b82f6',
  Sports: '#10b981',
  Academic: '#8b5cf6',
  Social: '#ec4899',
  Music: '#f59e0b',
  Career: '#06b6d4',
};

function EventCard({ event, onBookmarkToggle, isBookmarked }) {
  const catColor = CATEGORY_COLORS[event.category] || '#6366f1';
  const registered = event.registrationCount || 0;
  const capacity = event.capacity || 0;

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmarkToggle) onBookmarkToggle(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} style={styles.link}>
      <div
        style={styles.card}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
        }}
      >
        <div style={{ ...styles.hero, background: `linear-gradient(135deg, ${catColor}dd, ${catColor}88)` }}>
          <div style={styles.heroContent}>
            <div style={styles.heroDate}>
              <span style={styles.heroDateText}>{formatDate(event.date)}</span>
              {event.time && <span style={styles.heroTime}>{formatTime(event.time)}</span>}
            </div>
            <span style={{ ...styles.badge, backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
              {event.category}
            </span>
          </div>
          {onBookmarkToggle && (
            <button onClick={handleBookmark} style={styles.bookmarkBtn} aria-label="Bookmark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>

        <div style={styles.body}>
          <h3 style={styles.title}>{event.title}</h3>

          {event.description && (
            <p style={styles.description}>{event.description}</p>
          )}

          {event.location && (
            <div style={styles.metaRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={styles.metaText}>{event.location}</span>
            </div>
          )}

          <div style={styles.footer}>
            <CapacityBar registered={registered} capacity={capacity} />
            {registered > 0 && (
              <span style={styles.attendeeBadge}>{registered} attending</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const styles = {
  link: { textDecoration: 'none', color: 'inherit', display: 'block' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    padding: '20px',
    position: 'relative',
    minHeight: '100px',
  },
  heroContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroDate: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  heroDateText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#fff',
  },
  heroTime: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 500,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  body: {
    padding: '16px 20px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 6px',
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.3,
  },
  description: {
    margin: '0 0 12px',
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  metaText: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 500,
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  attendeeBadge: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
  },
};

export default EventCard;
