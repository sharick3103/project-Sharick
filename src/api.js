
const BASE = 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}


export function findUser(email, password) {
  return request(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
}

export function getUsers() {
  return request('/users');
}

export function createUser(data) {
  return request('/users', { method: 'POST', body: JSON.stringify(data) });
}


export function getTasks() {
  return request('/tasks');
}

export function createTask(data) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTask(id, updates) {
  return request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
