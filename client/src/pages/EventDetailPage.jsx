import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent, getAttendees, registerForEvent, cancelRegistration, addBookmark, removeBookmark } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatDate';
import CapacityBar from '../components/CapacityBar';

const CATEGORY_COLORS = {
  Tech: '#3b82f6', Sports: '#10b981', Academic: '#8b5cf6',
  Social: '#ec4899', Music: '#f59e0b', Career: '#06b6d4',
};

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchEvent = () => {
    setLoading(true);
    Promise.all([getEvent(id), getAttendees(id).catch(() => ({ attendees: [] }))])
      .then(([ev, att]) => {
        setEvent(ev);
        setAttendees(att.attendees || []);
        setIsBookmarked(ev.isBookmarked || false);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await registerForEvent(id);
      fetchEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    setActionLoading(true);
    try {
      await cancelRegistration(id);
      fetchEvent();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
      } else {
        await addBookmark(id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  if (loading) return <div style={styles.page}><p style={styles.loadingText}>Loading event...</p></div>;
  if ((error && !event) || !event) return (
    <div style={styles.page}>
      <div style={styles.notFound}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="10" y1="14" x2="14" y2="18" />
          <line x1="14" y1="14" x2="10" y2="18" />
        </svg>
        <h2 style={styles.notFoundTitle}>Event Not Found</h2>
        <p style={styles.notFoundMsg}>This event may have been removed or doesn't exist.</p>
        <Link to="/" style={styles.notFoundLink}>&larr; Back to Events</Link>
      </div>
    </div>
  );

  const catColor = CATEGORY_COLORS[event.category] || '#6366f1';
  const registered = event.registrationCount || 0;
  const capacity = event.capacity || 0;
  const spotsLeft = event.spotsLeft ?? Math.max(capacity - registered, 0);

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← Back to Events</Link>

      <div style={{ ...styles.hero, background: `linear-gradient(135deg, ${catColor}, ${catColor}aa)` }}>
        <span style={styles.categoryBadge}>{event.category}</span>
        <h1 style={styles.heroTitle}>{event.title}</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <span style={styles.infoLabel}>Date</span>
              <span style={styles.infoValue}>{formatDate(event.date)}</span>
            </div>
          </div>
          {event.time && (
            <div style={styles.infoItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <span style={styles.infoLabel}>Time</span>
                <span style={styles.infoValue}>{formatTime(event.time)}</span>
              </div>
            </div>
          )}
          {event.location && (
            <div style={styles.infoItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <span style={styles.infoLabel}>Location</span>
                <span style={styles.infoValue}>{event.location}</span>
              </div>
            </div>
          )}
          <div style={styles.infoItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div>
              <span style={styles.infoLabel}>Capacity</span>
              <span style={styles.infoValue}>{spotsLeft} spots left</span>
            </div>
          </div>
        </div>

        <CapacityBar registered={registered} capacity={capacity} />

        {event.description && (
          <div style={styles.descSection}>
            <h3 style={styles.sectionTitle}>About this event</h3>
            <p style={styles.descText}>{event.description}</p>
          </div>
        )}

        {error && <div style={styles.errorBanner}>{error}</div>}

        <div style={styles.actions}>
          {user ? (
            <>
              <button
                onClick={event.isRegistered ? handleUnregister : handleRegister}
                disabled={actionLoading || (!event.isRegistered && spotsLeft === 0)}
                style={{
                  ...styles.primaryBtn,
                  ...(event.isRegistered ? styles.unregisterBtn : {}),
                  ...((actionLoading || (!event.isRegistered && spotsLeft === 0)) ? styles.disabledBtn : {}),
                }}
              >
                {actionLoading ? 'Processing...' : event.isRegistered ? 'Unregister' : spotsLeft === 0 ? 'Event Full' : 'Register for Event'}
              </button>
              <button onClick={handleBookmark} style={styles.bookmarkBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? '#ef4444' : 'none'} stroke={isBookmarked ? '#ef4444' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
            </>
          ) : (
            <div style={styles.loginPrompt}>
              <Link to="/login" style={styles.loginLink}>Login to register</Link> for this event
            </div>
          )}
        </div>

        {attendees.length > 0 && (
          <div style={styles.attendeeSection}>
            <h3 style={styles.sectionTitle}>Who's going</h3>
            <div style={styles.avatarRow}>
              {attendees.slice(0, 5).map((a, i) => (
                <div key={a.id || i} style={{ ...styles.avatar, marginLeft: i > 0 ? '-8px' : 0, zIndex: 5 - i }}>
                  {(a.displayName || a.display_name || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
              {attendees.length > 5 && (
                <span style={styles.moreText}>and {attendees.length - 5} others</span>
              )}
            </div>
          </div>
        )}

        <hr style={styles.divider} />

        <div style={styles.commentSection}>
          <h3 style={styles.sectionTitle}>Comments</h3>
          <div style={styles.placeholder}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p style={styles.placeholderText}>
              Comments coming soon — this feature is planned for a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const styles = {
  page: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  backLink: {
    display: 'inline-block', marginBottom: '16px', color: '#6366f1',
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
  },
  hero: {
    padding: '40px 32px', borderRadius: '16px', marginBottom: '24px',
  },
  categoryBadge: {
    display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
    fontSize: '0.75rem', fontWeight: 600, color: '#fff',
    background: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
    letterSpacing: '0.03em', marginBottom: '12px',
  },
  heroTitle: { margin: 0, fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 },
  content: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px', marginBottom: '20px',
  },
  infoItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  infoLabel: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' },
  infoValue: { display: 'block', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 },
  descSection: { marginTop: '24px' },
  sectionTitle: { margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' },
  descText: { margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.7 },
  errorBanner: {
    padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2',
    color: '#dc2626', fontSize: '0.85rem', marginTop: '16px', border: '1px solid #fecaca',
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px',
  },
  primaryBtn: {
    padding: '12px 24px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
  },
  unregisterBtn: {
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
  },
  disabledBtn: { opacity: 0.5, cursor: 'not-allowed' },
  bookmarkBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '12px 18px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', background: '#fff',
    color: '#475569', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
  },
  loginPrompt: {
    padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b',
  },
  loginLink: { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
  attendeeSection: { marginTop: '28px' },
  avatarRow: { display: 'flex', alignItems: 'center' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    color: '#fff', fontSize: '0.8rem', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #fff', position: 'relative',
  },
  moreText: { marginLeft: '8px', fontSize: '0.85rem', color: '#64748b' },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '28px 0' },
  commentSection: {},
  placeholder: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px',
    border: '1px dashed #e2e8f0',
  },
  placeholderText: { margin: 0, color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem' },
  loadingText: { textAlign: 'center', color: '#64748b', padding: '60px 0' },
  notFound: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', padding: '48px 24px', textAlign: 'center',
  },
  notFoundTitle: {
    fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginTop: '16px',
  },
  notFoundMsg: {
    fontSize: '1rem', color: '#64748b', marginTop: '8px', maxWidth: '400px', lineHeight: 1.5,
  },
  notFoundLink: {
    marginTop: '24px', padding: '10px 24px', backgroundColor: '#6366f1', color: '#fff',
    borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
  },
};
