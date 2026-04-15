import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivity, cancelRegistration } from '../services/api';
import { formatDate } from '../utils/formatDate';
import EmptyState from '../components/EmptyState';

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = () => {
    setLoading(true);
    getActivity()
      .then((data) => setRegistrations(data.activity || []))
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleUnregister = async (eventId) => {
    try {
      await cancelRegistration(eventId);
      fetchRegistrations();
    } catch (err) {
      console.error('Unregister failed:', err);
    }
  };

  if (loading) return <div style={styles.page}><p style={styles.loading}>Loading your events...</p></div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>My Events</h2>
      <p style={styles.subtitle}>Events you've registered for</p>

      {registrations.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={styles.list}>
          {registrations.map((reg) => {
            const ev = reg.event;
            return (
              <div key={reg.id} style={styles.card}>
                <div style={styles.cardBody}>
                  <Link to={`/events/${ev.id}`} style={styles.eventTitle}>{ev.title}</Link>
                  <div style={styles.meta}>
                    <span style={styles.metaItem}>{formatDate(ev.date)}</span>
                    {ev.time && <span style={styles.metaItem}>{formatTime(ev.time)}</span>}
                    {ev.location && <span style={styles.metaItem}>{ev.location}</span>}
                  </div>
                  <span style={{ ...styles.categoryBadge, backgroundColor: getCatColor(ev.category) }}>
                    {ev.category}
                  </span>
                </div>
                <button onClick={() => handleUnregister(ev.id)} style={styles.unregBtn}>
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const CAT_COLORS = {
  Tech: '#3b82f6', Sports: '#10b981', Academic: '#8b5cf6',
  Social: '#ec4899', Music: '#f59e0b', Career: '#06b6d4',
};
function getCatColor(cat) { return CAT_COLORS[cat] || '#6366f1'; }

const styles = {
  page: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', gap: '16px',
  },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 },
  eventTitle: {
    fontSize: '1rem', fontWeight: 600, color: '#1e293b', textDecoration: 'none',
  },
  meta: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  metaItem: { fontSize: '0.8rem', color: '#64748b' },
  categoryBadge: {
    alignSelf: 'flex-start', padding: '2px 10px', borderRadius: '12px',
    fontSize: '0.7rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase',
    marginTop: '4px',
  },
  unregBtn: {
    padding: '8px 14px', borderRadius: '8px',
    border: '1.5px solid #fecaca', background: '#fff', color: '#dc2626',
    fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', flexShrink: 0,
  },
  loading: { textAlign: 'center', color: '#64748b', padding: '60px 0' },
};
