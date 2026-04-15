import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword, getActivity } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ displayName: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [activities, setActivities] = useState([]);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ displayName: user.displayName || '', email: user.email || '' });
      getActivity()
        .then((data) => setActivities(data.activity || data.activities || []))
        .catch(() => {});
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    try {
      await updateProfile(profile);
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileErr(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwErr('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPwErr('Password must be at least 6 characters');
      return;
    }
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPwMsg('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwErr(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Profile Settings</h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Edit Profile</h3>
        {profileMsg && <div style={styles.success}>{profileMsg}</div>}
        {profileErr && <div style={styles.error}>{profileErr}</div>}
        <form onSubmit={handleProfileSave} style={styles.form}>
          <label style={styles.label}>
            Display Name
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              style={styles.input}
            />
          </label>
          <button type="submit" style={styles.saveBtn}>Save Changes</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Change Password</h3>
        {pwMsg && <div style={styles.success}>{pwMsg}</div>}
        {pwErr && <div style={styles.error}>{pwErr}</div>}
        <form onSubmit={handlePasswordChange} style={styles.form}>
          <label style={styles.label}>
            Current Password
            <input type="password" value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              style={styles.input} required />
          </label>
          <label style={styles.label}>
            New Password
            <input type="password" value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              style={styles.input} required />
          </label>
          <label style={styles.label}>
            Confirm New Password
            <input type="password" value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              style={styles.input} required />
          </label>
          <button type="submit" style={styles.saveBtn}>Change Password</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recent Activity</h3>
        {activities.length === 0 ? (
          <p style={styles.emptyText}>No recent activity</p>
        ) : (
          <div style={styles.timeline}>
            {activities.map((a, i) => (
              <div key={i} style={styles.timelineItem}>
                <div style={styles.dot} />
                <div>
                  <p style={styles.activityText}>
                    Registered for <strong>{a.event?.title || a.eventTitle || 'an event'}</strong>
                  </p>
                  <span style={styles.activityDate}>
                    {new Date(a.registeredAt || a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '640px', margin: '0 auto', padding: '32px 24px' },
  pageTitle: { margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px',
  },
  cardTitle: { margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  label: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    fontSize: '0.85rem', fontWeight: 600, color: '#334155',
  },
  input: {
    padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '0.9rem', color: '#1e293b', outline: 'none', fontWeight: 400,
  },
  saveBtn: {
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
    alignSelf: 'flex-start', marginTop: '4px',
  },
  success: {
    padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4',
    color: '#16a34a', fontSize: '0.85rem', marginBottom: '12px', border: '1px solid #bbf7d0',
  },
  error: {
    padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2',
    color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px', border: '1px solid #fecaca',
  },
  emptyText: { color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '16px' },
  timelineItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  dot: {
    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1',
    marginTop: '6px', flexShrink: 0,
  },
  activityText: { margin: 0, fontSize: '0.9rem', color: '#334155' },
  activityDate: { fontSize: '0.8rem', color: '#94a3b8' },
};
