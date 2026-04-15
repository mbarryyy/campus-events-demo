import { useState, useEffect, useCallback } from 'react';
import { getAdminUsers } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ROLE_STYLES = {
  admin: { bg: '#fef3c7', color: '#d97706' },
  user: { bg: '#f0f4ff', color: '#6366f1' },
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ page, limit: 20, search: search || undefined });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Manage Users</h1>

      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search users by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={styles.totalCount}>{pagination.total} user{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Display Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Registrations</th>
                  <th style={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.user;
                  return (
                    <tr key={user.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.username}>{user.username}</span>
                      </td>
                      <td style={styles.td}>{user.displayName}</td>
                      <td style={styles.td}>
                        <span style={styles.email}>{user.email}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.roleBadge,
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={styles.td}>{user.registrationCount}</td>
                      <td style={styles.td}>{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <p style={styles.emptyText}>No users found</p>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageBtn, ...(page <= 1 ? styles.pageBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                style={{ ...styles.pageBtn, ...(page >= pagination.totalPages ? styles.pageBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '24px',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '16px',
  },
  searchBox: {
    position: 'relative',
    flex: '0 1 400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 40px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#fff',
  },
  totalCount: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    transition: 'background 0.15s',
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap',
  },
  username: {
    fontWeight: 600,
    color: '#1e293b',
  },
  email: {
    color: '#64748b',
  },
  roleBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    padding: '32px',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '20px',
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
};

export default AdminUsersPage;
