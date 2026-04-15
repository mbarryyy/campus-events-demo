import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      /* ignore if not logged in */
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    const onFocus = () => fetchUnreadCount();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (notif.eventId) navigate(`/events/${notif.eventId}`);
  };

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
    <div style={styles.wrapper} ref={panelRef}>
      <button style={styles.bellBtn} onClick={() => setOpen(!open)} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button style={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div style={styles.panelList}>
            {notifications.length === 0 ? (
              <p style={styles.empty}>No notifications yet</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    ...styles.notifItem,
                    backgroundColor: notif.read ? 'transparent' : '#f0f4ff',
                    fontWeight: notif.read ? 400 : 600,
                  }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div style={styles.notifTitle}>{notif.title}</div>
                  <div style={styles.notifMsg}>{notif.message}</div>
                  <div style={styles.notifTime}>{timeAgo(notif.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
  },
  bellBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    borderRadius: '10px',
    padding: '1px 5px',
    minWidth: '18px',
    textAlign: 'center',
    lineHeight: '16px',
  },
  panel: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '340px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    zIndex: 1000,
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  panelTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1e293b',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  panelList: {
    maxHeight: '320px',
    overflowY: 'auto',
  },
  empty: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
  },
  notifItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  notifTitle: {
    fontSize: '0.85rem',
    color: '#1e293b',
    marginBottom: '2px',
  },
  notifMsg: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '400 !important',
    lineHeight: 1.4,
  },
  notifTime: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
};

export default NotificationBell;
