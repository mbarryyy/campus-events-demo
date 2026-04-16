const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders(json = true) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

// ── Auth ──
export function register(data) {
  return request(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export function login(email, password) {
  return request(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request(`${API_BASE}/auth/me`, { headers: getHeaders(false) });
}

export function updateProfile(data) {
  return request(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export function changePassword(data) {
  return request(`${API_BASE}/auth/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export function getActivity() {
  return request(`${API_BASE}/auth/activity`, { headers: getHeaders(false) });
}

export function getDashboard() {
  return request(`${API_BASE}/auth/dashboard`, { headers: getHeaders(false) });
}

// ── Events ──
export function getEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return request(`${API_BASE}/events${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(false),
  });
}

export function getEvent(id) {
  return request(`${API_BASE}/events/${id}`, { headers: getHeaders(false) });
}

export function createEvent(data) {
  return request(`${API_BASE}/events`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export function updateEvent(id, data) {
  return request(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
}

export function deleteEvent(id) {
  return request(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
}

export function getAttendees(id) {
  return request(`${API_BASE}/events/${id}/attendees`, {
    headers: getHeaders(false),
  });
}

// ── Registrations ──
export function registerForEvent(eventId) {
  return request(`${API_BASE}/events/${eventId}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ eventId }),
  });
}

export function cancelRegistration(eventId) {
  return request(`${API_BASE}/events/${eventId}/register`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ eventId }),
  });
}

// ── Bookmarks ──
export function addBookmark(eventId) {
  return request(`${API_BASE}/events/${eventId}/bookmark`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ eventId }),
  });
}

export function removeBookmark(eventId) {
  return request(`${API_BASE}/events/${eventId}/bookmark`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ eventId }),
  });
}

export function getBookmarks() {
  return request(`${API_BASE}/bookmarks`, { headers: getHeaders(false) });
}

// ── Notifications ──
export function getNotifications() {
  return request(`${API_BASE}/notifications`, { headers: getHeaders(false) });
}

export function getUnreadCount() {
  return request(`${API_BASE}/notifications/unread-count`, {
    headers: getHeaders(false),
  });
}

export function markNotificationRead(id) {
  return request(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders(false),
  });
}

export function markAllNotificationsRead() {
  return request(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders(false),
  });
}

// ── Comments ──
export function getComments(eventId, page = 1) {
  const query = new URLSearchParams({ page });
  return request(`${API_BASE}/events/${eventId}/comments?${query}`, {
    headers: getHeaders(false),
  });
}

export function createComment(eventId, body) {
  return request(`${API_BASE}/events/${eventId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ body }),
  });
}

export function deleteComment(eventId, commentId) {
  return request(`${API_BASE}/events/${eventId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
}

// ── Admin ──
export function getAdminStats() {
  return request(`${API_BASE}/admin/stats`, { headers: getHeaders(false) });
}

export function getAdminUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return request(`${API_BASE}/admin/users${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(false),
  });
}

export function getAdminEventAttendees(eventId) {
  return request(`${API_BASE}/admin/events/${eventId}/attendees`, {
    headers: getHeaders(false),
  });
}
