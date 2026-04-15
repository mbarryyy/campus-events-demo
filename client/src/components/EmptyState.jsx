function EmptyState({ title = 'No events found', subtitle = 'Try adjusting your filters or search' }) {
  return (
    <div style={styles.container}>
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="14" x2="15" y2="14" />
        <line x1="9" y1="18" x2="13" y2="18" />
      </svg>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    marginTop: '24px',
  },
  icon: {
    width: '64px',
    height: '64px',
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#475569',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#94a3b8',
  },
};

export default EmptyState;
