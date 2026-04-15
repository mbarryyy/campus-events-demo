import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Checking access..." />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div style={styles.layout}>
      <AdminSidebar />
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    marginLeft: '250px',
    padding: '32px',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
  },
};

export default AdminLayout;
