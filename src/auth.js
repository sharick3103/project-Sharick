
const SESSION_KEY = 'riwiflow_session';

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin() {
  return getSession()?.role === 'admin';
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function getInitials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
