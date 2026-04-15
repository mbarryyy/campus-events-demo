import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div style={styles.layout}>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route
            path="/my-events"
            element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>}
          />
          <Route
            path="/bookmarks"
            element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    width: '100%',
  },
};

export default App;
