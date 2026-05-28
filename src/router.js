
import { isAuthenticated } from './auth.js';
import { renderLogin } from './views/login.js';
import { renderBoard } from './views/board.js';

const app = document.getElementById('app');

export function navigate(hash) {
  window.location.hash = hash;
}

function resolveRoute() {
  const hash = window.location.hash || '#/login';
  const loggedIn = isAuthenticated();

  if (hash !== '#/login' && !loggedIn) {
    navigate('#/login');
    return;
  }

  if (hash === '#/login' && loggedIn) {
    navigate('#/board');
    return;
  }

  if (hash === '#/login') renderLogin(app);
  else if (hash === '#/board') renderBoard(app);
  else navigate(loggedIn ? '#/board' : '#/login');
}

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
