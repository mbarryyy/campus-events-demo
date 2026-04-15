import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', displayName: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        displayName: form.displayName,
        password: form.password,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an account</h2>
        <p style={styles.subtitle}>Join CampusEvents to discover and register for events</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Username
            <input type="text" value={form.username} onChange={set('username')} style={styles.input} required placeholder="johndoe" />
          </label>
          <label style={styles.label}>
            Display Name
            <input type="text" value={form.displayName} onChange={set('displayName')} style={styles.input} required placeholder="John Doe" />
          </label>
          <label style={styles.label}>
            Email
            <input type="email" value={form.email} onChange={set('email')} style={styles.input} required placeholder="you@university.ac.nz" />
          </label>
          <label style={styles.label}>
            Password
            <input type="password" value={form.password} onChange={set('password')} style={styles.input} required placeholder="At least 6 characters" />
          </label>
          <label style={styles.label}>
            Confirm Password
            <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} style={styles.input} required placeholder="Re-enter password" />
          </label>
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  },
  title: { margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' },
  error: {
    padding: '10px 14px', borderRadius: '8px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  label: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    fontSize: '0.85rem', fontWeight: 600, color: '#334155',
  },
  input: {
    padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem',
    color: '#1e293b', outline: 'none', fontWeight: 400,
  },
  submitBtn: {
    padding: '12px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', fontSize: '0.95rem', fontWeight: 600,
    cursor: 'pointer', marginTop: '8px',
  },
  footerText: { marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' },
  link: { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
};
