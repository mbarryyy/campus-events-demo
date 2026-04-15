import EventCard from './EventCard';
import EmptyState from './EmptyState';

function EventList({ events, onEventClick }) {
  if (events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <p style={styles.count}>
        Showing <strong>{events.length}</strong> event{events.length !== 1 ? 's' : ''}
      </p>
      <div style={styles.grid}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  count: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
};

export default EventList;
