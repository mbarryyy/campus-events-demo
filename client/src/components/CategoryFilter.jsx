const CATEGORY_META = {
  All: { color: '#6366f1' },
  Tech: { color: '#3b82f6' },
  Sports: { color: '#10b981' },
  Academic: { color: '#8b5cf6' },
  Social: { color: '#ec4899' },
  Music: { color: '#f59e0b' },
  Career: { color: '#06b6d4' },
};

function CategoryFilter({ categories, selected, onChange }) {
  const allCats = ['All', ...categories];

  return (
    <div style={styles.container}>
      {allCats.map((cat) => {
        const isActive = cat === 'All' ? selected === '' : selected === cat;
        const meta = CATEGORY_META[cat] || { color: '#6366f1' };

        return (
          <button
            key={cat}
            style={{
              ...styles.pill,
              ...(isActive
                ? { backgroundColor: meta.color, color: '#fff', borderColor: meta.color }
                : {}),
            }}
            onClick={() => onChange(cat === 'All' ? '' : cat)}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = meta.color + '14';
                e.currentTarget.style.borderColor = meta.color + '40';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            <span
              style={{
                ...styles.dot,
                backgroundColor: isActive ? '#fff' : meta.color,
              }}
            />
            {cat}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '24px',
    background: '#fff',
    color: '#334155',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

export default CategoryFilter;
