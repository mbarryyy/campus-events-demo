import EventCard from './EventCard';
import EmptyState from './EmptyState';

function EventList({ events }) {
  if (events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default EventList;
