function EventCard({ event }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{event.title}</h3>
        <span style={{
          ...styles.badge,
          backgroundColor: event.category === 'Tech' ? '#e0f2fe' : '#fef3c7',
          color: event.category === 'Tech' ? '#0369a1' : '#92400e',
        }}>
          {event.category}
        </span>
      </div>
      <p style={styles.date}>{event.date}</p>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  date: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },
};

export default EventCard;
