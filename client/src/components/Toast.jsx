const TYPE_STYLES = {
  success: { bg: '#10b981', icon: 'M5 13l4 4L19 7' },
  error: { bg: '#ef4444', icon: 'M6 18L18 6M6 6l12 12' },
  info: { bg: '#3b82f6', icon: 'M12 8v4m0 4h.01' },
};

function Toast({ toast, onClose }) {
  const typeStyle = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div style={{ ...styles.toast, backgroundColor: typeStyle.bg }} className="toast-slide-in">
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={typeStyle.icon} />
      </svg>
      <span style={styles.message}>{toast.message}</span>
      <button style={styles.close} onClick={onClose} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

const styles = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    pointerEvents: 'auto',
    animation: 'toast-slide-in 0.3s ease-out',
    minWidth: '280px',
    maxWidth: '420px',
  },
  icon: {
    width: '18px',
    height: '18px',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  close: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: '4px',
    transition: 'color 0.2s',
  },
};

export default Toast;
