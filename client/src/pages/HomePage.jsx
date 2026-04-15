import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents, addBookmark, removeBookmark, getBookmarks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CategoryFilter from '../components/CategoryFilter';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const CATEGORIES = ['Tech', 'Sports', 'Academic', 'Social', 'Music', 'Career'];

export default function HomePage({ searchQuery }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get('page'), 10);
    return p > 0 ? p : 1;
  });
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Sync page to URL
  useEffect(() => {
    if (page > 1) {
      setSearchParams({ page: String(page) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [page, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    setLoading(true);
    getEvents({ category: selectedCategory || undefined, search: searchQuery || undefined, page, limit: 12 })
      .then((data) => {
        setEvents(data.events || data);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, page]);

  useEffect(() => {
    if (user) {
      getBookmarks()
        .then((data) => {
          const ids = new Set((data.bookmarks || data || []).map((b) => b.eventId || b.event_id || b.id));
          setBookmarkedIds(ids);
        })
        .catch(() => {});
    } else {
      setBookmarkedIds(new Set());
    }
  }, [user]);

  const handleBookmarkToggle = async (eventId) => {
    if (!user) return;
    try {
      if (bookmarkedIds.has(eventId)) {
        await removeBookmark(eventId);
        setBookmarkedIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
      } else {
        await addBookmark(eventId);
        setBookmarkedIds((prev) => new Set(prev).add(eventId));
      }
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const total = pagination.total || events.length;

  return (
    <div>
      <div style={styles.filterSection}>
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Loading events...</div>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p style={styles.count}>
            Showing <strong>{events.length}</strong> of <strong>{total}</strong> event{total !== 1 ? 's' : ''}
          </p>
          <div style={styles.grid}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onBookmarkToggle={user ? handleBookmarkToggle : undefined}
                isBookmarked={bookmarkedIds.has(event.id)}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  filterSection: { marginBottom: '24px' },
  count: { fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  loading: {
    textAlign: 'center', padding: '60px 24px', color: '#64748b', fontSize: '0.95rem',
  },
};
