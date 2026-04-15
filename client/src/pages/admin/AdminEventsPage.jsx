import { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const CATEGORIES = ['Tech', 'Sports', 'Academic', 'Social', 'Music', 'Career'];

const CATEGORY_COLORS = {
  Tech: '#3b82f6',
  Sports: '#10b981',
  Academic: '#8b5cf6',
  Social: '#ec4899',
  Music: '#f59e0b',
  Career: '#06b6d4',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: 'Tech',
  capacity: '',
};

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { addToast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.getEvents({ limit: 100 });
      setEvents(data.events || data);
    } catch {
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...form,
      capacity: Number(form.capacity),
    };

    try {
      if (editingId) {
        await api.updateEvent(editingId, payload);
      } else {
        await api.createEvent(payload);
      }
      addToast(editingId ? 'Event updated' : 'Event created', 'success');
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchEvents();
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      category: event.category,
      capacity: String(event.capacity || ''),
    });
    setEditingId(event.id);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEvent(id);
      addToast('Event deleted', 'success');
      setDeleteConfirm(null);
      fetchEvents();
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  if (loading) return <LoadingSpinner text="Loading events..." />;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Manage Events</h1>
        <button
          style={styles.createBtn}
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setFormError('');
            setShowForm(true);
          }}
        >
          + Create New Event
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editingId ? 'Edit Event' : 'Create Event'}</h2>
          {formError && <p style={styles.formError}>{formError}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Title *
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={100}
                />
              </label>
              <label style={styles.label}>
                Category *
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label style={styles.label}>
              Description
              <textarea
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
              />
            </label>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Date *
                <input
                  style={styles.input}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label style={styles.label}>
                Time *
                <input
                  style={styles.input}
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </label>
            </div>
            <div style={styles.formRow}>
              <label style={styles.label}>
                Location *
                <input
                  style={styles.input}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </label>
              <label style={styles.label}>
                Capacity *
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  required
                />
              </label>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn}>
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Capacity</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} style={styles.tr}>
                <td style={styles.td}>
                  <span style={styles.eventTitle}>{event.title}</span>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.catBadge,
                      backgroundColor: `${CATEGORY_COLORS[event.category] || '#6366f1'}15`,
                      color: CATEGORY_COLORS[event.category] || '#6366f1',
                    }}
                  >
                    {event.category}
                  </span>
                </td>
                <td style={styles.td}>{event.date}</td>
                <td style={styles.td}>{event.time || '—'}</td>
                <td style={styles.td}>{event.location || '—'}</td>
                <td style={styles.td}>
                  {event.registrationCount !== undefined
                    ? `${event.registrationCount}/${event.capacity}`
                    : event.capacity}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button style={styles.editBtn} onClick={() => handleEdit(event)}>
                    Edit
                  </button>
                  {deleteConfirm === event.id ? (
                    <>
                      <button
                        style={styles.confirmDeleteBtn}
                        onClick={() => handleDelete(event.id)}
                      >
                        Confirm
                      </button>
                      <button
                        style={styles.cancelDeleteBtn}
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      style={styles.deleteBtn}
                      onClick={() => setDeleteConfirm(event.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <p style={styles.emptyText}>No events found. Create your first event!</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  formError: {
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
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
  eventTitle: {
    fontWeight: 600,
    color: '#1e293b',
  },
  catBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#f0f4ff',
    color: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: '6px',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  confirmDeleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '6px',
    transition: 'background 0.2s',
  },
  cancelDeleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  emptyText: {
    textAlign: 'center',
    padding: '32px',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
};

export default AdminEventsPage;
