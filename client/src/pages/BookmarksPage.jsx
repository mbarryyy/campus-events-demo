import { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark } from '../services/api';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    getBookmarks()
      .then((data) => setBookmarks(data.bookmarks || data || []))
      .catch((err) => console.error('Failed to load bookmarks:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const handleRemove = async (eventId) => {
    try {
      await removeBookmark(eventId);
      fetchBookmarks();
    } catch (err) {
      console.error('Remove bookmark failed:', err);
    }
  };

  if (loading) return <div style={styles.page}><p style={styles.loading}>Loading bookmarks...</p></div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Saved Events</h2>
      <p style={styles.subtitle}>Events you've bookmarked for later</p>

      {bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={styles.grid}>
          {bookmarks.map((bm) => {
            const event = bm.event || bm;
            return (
              <div key={event.id || bm.id} style={styles.cardWrapper}>
                <EventCard event={event} isBookmarked onBookmarkToggle={() => handleRemove(event.id)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  title: { margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem',
  },
  cardWrapper: { display: 'flex', flexDirection: 'column' },
  loading: { textAlign: 'center', color: '#64748b', padding: '60px 0' },
};
