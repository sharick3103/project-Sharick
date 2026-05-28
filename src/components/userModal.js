
import { createUser } from '../api.js';
import { showToast } from './toast.js';

export function openUserModal(onSuccess) {
  closeUserModal();

  const overlay = document.createElement('div');
  overlay.id = 'user-modal-overlay';
  overlay.className = 'modal-overlay fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center px-gutter';

  overlay.innerHTML = `
    <div class="modal-panel bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-[440px] p-xl space-y-lg">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-md text-headline-md text-on-surface">Add New User</h2>
        <button id="user-modal-close" class="material-symbols-outlined text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low">close</button>
      </div>

      <form id="user-form" class="space-y-lg">
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Full Name</label>
          <input id="user-name" type="text" placeholder="John Doe" required
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring" />
        </div>

        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Email</label>
          <input id="user-email" type="email" placeholder="user@company.com" required
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring" />
        </div>

        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Password</label>
          <input id="user-password" type="password" placeholder="••••••••" required
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring" />
        </div>

        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Role</label>
          <select id="user-role" class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring">
            <option value="coder">Coder</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="flex gap-md pt-sm">
          <button type="button" id="user-cancel-btn"
            class="flex-1 py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low">
            Cancel
          </button>
          <button type="submit" id="user-save-btn"
            class="flex-1 bg-primary hover:opacity-90 text-on-primary py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm">
            <span id="user-save-text">Create User</span>
            <span id="user-save-spinner" class="hidden w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeUserModal(); });
  document.getElementById('user-modal-close').addEventListener('click', closeUserModal);
  document.getElementById('user-cancel-btn').addEventListener('click', closeUserModal);

  const escHandler = e => { if (e.key === 'Escape') closeUserModal(); };
  document.addEventListener('keydown', escHandler);
  overlay._escHandler = escHandler;

  document.getElementById('user-form').addEventListener('submit', async e => {
    e.preventDefault();
    const saveBtn = document.getElementById('user-save-btn');
    const saveText = document.getElementById('user-save-text');
    const spinner = document.getElementById('user-save-spinner');

    saveBtn.disabled = true;
    saveText.textContent = 'Creating...';
    spinner.classList.remove('hidden');

    try {
      const name = document.getElementById('user-name').value.trim();
      const email = document.getElementById('user-email').value.trim();
      const password = document.getElementById('user-password').value;
      const role = document.getElementById('user-role').value;

      await createUser({ name, email, password, role });
      showToast(`User "${name}" created!`, 'success');
      closeUserModal();
      if (onSuccess) onSuccess();
    } catch {
      showToast('Failed to create user.', 'error');
      saveBtn.disabled = false;
      saveText.textContent = 'Create User';
      spinner.classList.add('hidden');
    }
  });
}

export function closeUserModal() {
  const overlay = document.getElementById('user-modal-overlay');
  if (overlay) {
    if (overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
    overlay.remove();
  }
}
