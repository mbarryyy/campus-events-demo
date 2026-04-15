function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          ...(selected === '' ? styles.active : {}),
        }}
        onClick={() => onChange('')}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          style={{
            ...styles.button,
            ...(selected === cat ? styles.active : {}),
          }}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  button: {
    padding: '8px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  active: {
    background: '#1e293b',
    color: '#fff',
    borderColor: '#1e293b',
    fontWeight: 600,
  },
};

export default CategoryFilter;
