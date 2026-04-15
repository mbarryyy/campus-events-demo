export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.btn, ...(page <= 1 ? styles.disabled : {}) }}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={styles.dots}>...</span>
        ) : (
          <button
            key={p}
            style={{ ...styles.btn, ...(p === page ? styles.active : {}) }}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        style={{ ...styles.btn, ...(page >= totalPages ? styles.disabled : {}) }}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', marginTop: '32px',
  },
  btn: {
    padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
    background: '#fff', color: '#334155', fontSize: '0.875rem', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  active: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', borderColor: 'transparent',
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
  dots: { padding: '8px 4px', color: '#94a3b8', fontSize: '0.875rem' },
};
