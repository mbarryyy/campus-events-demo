import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div style={styles.container}>
      <div style={styles.code}>404</div>
      <h1 style={styles.title}>Page not found</h1>
      <p style={styles.message}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" style={styles.link}>
        &larr; Back to Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '48px 24px',
    textAlign: 'center',
  },
  code: {
    fontSize: '7rem',
    fontWeight: 800,
    color: '#e2e8f0',
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '8px',
  },
  message: {
    fontSize: '1rem',
    color: '#64748b',
    marginTop: '8px',
    maxWidth: '400px',
    lineHeight: 1.5,
  },
  link: {
    marginTop: '24px',
    padding: '10px 24px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
};

export default NotFoundPage;
