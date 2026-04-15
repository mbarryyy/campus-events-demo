import { useState, useEffect } from 'react';
import { getEvents } from './services/api';
import CategoryFilter from './components/CategoryFilter';
import EventList from './components/EventList';

const CATEGORIES = ['Tech', 'Sports'];

function App() {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    getEvents(selectedCategory || undefined)
      .then(setEvents)
      .catch((err) => console.error('Failed to load events:', err));
  }, [selectedCategory]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Campus Events</h1>
      <CategoryFilter
        categories={CATEGORIES}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <EventList events={events} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  heading: {
    marginBottom: '20px',
  },
};

export default App;
