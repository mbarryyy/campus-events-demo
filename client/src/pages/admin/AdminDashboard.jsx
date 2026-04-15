import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORY_COLORS = {
  Tech: '#3b82f6',
  Sports: '#10b981',
  Academic: '#8b5cf6',
  Social: '#ec4899',
  Music: '#f59e0b',
  Career: '#06b6d4',
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={styles.error}>{error}</div>;
  if (!stats) return <LoadingSpinner text="Loading dashboard..." />;

  const maxCategoryCount = Math.max(...Object.values(stats.eventsByCategory), 1);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>

      <div style={styles.statsGrid}>
        <StatCard icon="users" label="Total Users" value={stats.totalUsers} />
        <StatCard icon="calendar" label="Total Events" value={stats.totalEvents} />
        <StatCard icon="ticket" label="Total Registrations" value={stats.totalRegistrations} />
        <StatCard icon="clock" label="Upcoming Events" value={stats.upcomingEvents} />
      </div>

      <div style={styles.panels}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Recent Registrations</h2>
          {stats.recentRegistrations.length === 0 ? (
            <p style={styles.emptyText}>No registrations yet</p>
          ) : (
            <div style={styles.regList}>
              {stats.recentRegistrations.map((reg) => (
                <div key={reg.id} style={styles.regItem}>
                  <div style={styles.regInfo}>
                    <span style={styles.regUser}>{reg.user.displayName}</span>
                    <span style={styles.regArrow}>&rarr;</span>
                    <span style={styles.regEvent}>{reg.event.title}</span>
                  </div>
                  <span style={styles.regTime}>{timeAgo(reg.registeredAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Events by Category</h2>
          <div style={styles.chartArea}>
            {Object.entries(stats.eventsByCategory).map(([category, count]) => (
              <div key={category} style={styles.chartRow}>
                <span style={styles.chartLabel}>{category}</span>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.bar,
                      width: `${(count / maxCategoryCount) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[category] || '#6366f1',
                    }}
                  >
                    <span style={styles.barCount}>{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  error: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '8px',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  panels: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  panelTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '24px 0',
  },
  regList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  regItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    gap: '8px',
  },
  regInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
    minWidth: 0,
  },
  regUser: {
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  regArrow: {
    color: '#94a3b8',
    flexShrink: 0,
  },
  regEvent: {
    fontSize: '0.85rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  regTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chartArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chartLabel: {
    width: '75px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#475569',
    textAlign: 'right',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    height: '28px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    minWidth: '32px',
    transition: 'width 0.5s ease',
  },
  barCount: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
  },
};

export default AdminDashboard;
