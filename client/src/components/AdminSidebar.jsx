import { useLocation, Link } from 'react-router-dom';

const NAV_ITEMS = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
  },
  {
    path: '/admin/events',
    label: 'Events',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
  },
];

function AdminSidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <svg style={styles.logo} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span style={styles.headerText}>Admin Panel</span>
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navLink,
              ...(isActive(item.path) ? styles.navLinkActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.footer}>
        <Link to="/" style={styles.backLink}>
          <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    backgroundColor: '#1e293b',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 50,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 20px 16px',
    borderBottom: '1px solid #334155',
  },
  logo: {
    width: '24px',
    height: '24px',
    color: '#818cf8',
  },
  headerText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navLinkActive: {
    backgroundColor: '#334155',
    color: '#fff',
  },
  navIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  footer: {
    padding: '12px 8px 20px',
    borderTop: '1px solid #334155',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
};

export default AdminSidebar;
