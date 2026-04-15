import { useState, useEffect } from 'react';
import { getEvents } from './services/api';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import EventList from './components/EventList';
import EventModal from './components/EventModal';

const CATEGORIES = ['Tech', 'Sports', 'Academic', 'Social'];

function App() {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    getEvents(selectedCategory || undefined, searchQuery || undefined)
      .then(setEvents)
      .catch((err) => console.error('Failed to load events:', err));
  }, [selectedCategory, searchQuery]);

  return (
    <div>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main style={styles.main}>
        <div style={styles.filterSection}>
          <CategoryFilter
            categories={CATEGORIES}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
        <EventList events={events} onEventClick={setSelectedEvent} />
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </main>
    </div>
  );
}

const styles = {
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  filterSection: {
    marginBottom: '28px',
  },
};

export default App;
