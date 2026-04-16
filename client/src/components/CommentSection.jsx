import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getComments, createComment, deleteComment } from '../services/api';

export default function CommentSection({ eventId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = (page = 1) => {
    setLoading(true);
    getComments(eventId, page)
      .then((data) => {
        setComments(data.comments);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError('');
    try {
      await createComment(eventId, trimmed);
      setBody('');
      fetchComments(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(eventId, commentId);
      fetchComments(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const charCount = body.length;

  return (
    <div>
      <h3 style={styles.title}>Comments ({pagination.total})</h3>

      {user && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            rows={3}
            style={styles.textarea}
          />
          <div style={styles.formFooter}>
            <span style={{ ...styles.charCount, color: charCount > 450 ? '#ef4444' : '#94a3b8' }}>
              {charCount}/500
            </span>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              style={{
                ...styles.submitBtn,
                ...(submitting || !body.trim() ? styles.submitBtnDisabled : {}),
              }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {!user && (
        <p style={styles.loginHint}>
          <a href="/login" style={styles.loginLink}>Log in</a> to leave a comment.
        </p>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={styles.loadingText}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={styles.emptyText}>No comments yet. Be the first!</span>
        </div>
      ) : (
        <div style={styles.commentList}>
          {comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <div style={styles.avatar}>
                  {(c.author.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span style={styles.authorName}>{c.author.displayName}</span>
                  <span style={styles.timestamp}>{formatAgo(c.createdAt)}</span>
                </div>
                {user && (user.id === c.author.id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={styles.deleteBtn}
                    title="Delete comment"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
              <p style={styles.commentBody}>{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={styles.paginationRow}>
          <button
            onClick={() => fetchComments(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={{ ...styles.pageBtn, ...(pagination.page <= 1 ? styles.pageBtnDisabled : {}) }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchComments(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={{ ...styles.pageBtn, ...(pagination.page >= pagination.totalPages ? styles.pageBtnDisabled : {}) }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function formatAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr + 'Z');
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

const styles = {
  title: {
    margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: '#1e293b',
  },
  form: {
    marginBottom: '20px',
  },
  textarea: {
    width: '100%', padding: '12px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit',
    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  formFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px',
  },
  charCount: {
    fontSize: '0.75rem',
  },
  submitBtn: {
    padding: '8px 18px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.5, cursor: 'not-allowed',
  },
  loginHint: {
    fontSize: '0.875rem', color: '#64748b', marginBottom: '16px',
  },
  loginLink: {
    color: '#4f46e5', fontWeight: 600, textDecoration: 'none',
  },
  error: {
    padding: '8px 12px', borderRadius: '8px', backgroundColor: '#fef2f2',
    color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px', border: '1px solid #fecaca',
  },
  loadingText: {
    color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic',
  },
  emptyState: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px',
    border: '1px dashed #e2e8f0',
  },
  emptyText: {
    color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic',
  },
  commentList: {
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  comment: {
    padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
  },
  commentHeader: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    color: '#fff', fontSize: '0.75rem', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  authorName: {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
  },
  timestamp: {
    display: 'block', fontSize: '0.7rem', color: '#94a3b8',
  },
  deleteBtn: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer', padding: '4px',
    borderRadius: '4px', display: 'flex', alignItems: 'center',
  },
  commentBody: {
    margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.6,
  },
  paginationRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px',
  },
  pageBtn: {
    padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0',
    background: '#fff', color: '#475569', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
  },
  pageBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.8rem', color: '#64748b',
  },
};
