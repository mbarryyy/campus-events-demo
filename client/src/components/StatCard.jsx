const ICONS = {
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  calendar: 'M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M1 10h22',
  ticket: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
};

const COLORS = {
  users: '#6366f1',
  calendar: '#3b82f6',
  ticket: '#10b981',
  clock: '#f59e0b',
};

function StatCard({ icon = 'users', label, value }) {
  const color = COLORS[icon] || '#6366f1';
  const pathData = ICONS[icon] || ICONS.users;

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
      <div style={{ ...styles.iconWrap, backgroundColor: `${color}15` }}>
        <svg style={{ ...styles.icon, color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={pathData} />
        </svg>
      </div>
      <div>
        <div style={styles.value}>{value}</div>
        <div style={styles.label}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1e293b',
    lineHeight: 1.1,
  },
  label: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
    marginTop: '4px',
  },
};

export default StatCard;
