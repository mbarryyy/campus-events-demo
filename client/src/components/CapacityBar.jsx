export default function CapacityBar({ registered, capacity, showLabel = true }) {
  const pct = capacity > 0 ? Math.min((registered / capacity) * 100, 100) : 0;
  const spotsLeft = Math.max(capacity - registered, 0);
  let color = '#10b981';
  if (pct >= 90) color = '#ef4444';
  else if (pct >= 70) color = '#f59e0b';

  return (
    <div style={styles.wrapper}>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%`, backgroundColor: color }} />
      </div>
      {showLabel && (
        <span style={styles.label}>
          {spotsLeft === 0 ? 'Full' : `${registered}/${capacity} spots`}
        </span>
      )}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
  track: {
    flex: 1, height: '6px', backgroundColor: '#e2e8f0',
    borderRadius: '3px', overflow: 'hidden',
  },
  fill: {
    height: '100%', borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  label: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' },
};
