function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} className="spinner" />
      {text && <p style={styles.text}>{text}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    marginTop: '16px',
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: 500,
  },
};

export default LoadingSpinner;
