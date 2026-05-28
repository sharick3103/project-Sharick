
import { isAdmin, getSession } from '../auth.js';
import { createTask, updateTask, getUsers } from '../api.js';
import { showToast } from './toast.js';

const STATUSES = ['todo', 'in progress', 'in review', 'done'];
const STATUS_LABELS = {
  'todo': 'To Do',
  'in progress': 'In Progress',
  'in review': 'In Review',
  'done': 'Done',
};

export async function openCreateModal(onSuccess) {
  if (!isAdmin()) { showToast('Only admins can create tasks.', 'error'); return; }
  const users = await getUsers();
  showModal({ mode: 'create', task: null, users, onSuccess });
}

export async function openEditModal(task, onSuccess) {
  const session = getSession();
  const isOwner = session && task.userId === session.id;
  if (!isAdmin() && !isOwner) { showToast('You can only edit your own tasks.', 'error'); return; }
  const users = await getUsers();
  showModal({ mode: 'edit', task, users, onSuccess });
}

function showModal({ mode, task, users, onSuccess }) {
  closeModal();

  const admin = isAdmin();
  const isCreate = mode === 'create';

  const userOptions = users.map(u =>
    `<option value="${u.id}" ${task && task.userId === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`
  ).join('');

  const statusOptions = STATUSES.map(s => {
    const current = task?.status === 'pending' ? 'todo' : task?.status;
    const selected = isCreate ? (s === 'todo') : (s === current);
    return `<option value="${s}" ${selected ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.id = 'task-modal-overlay';
  overlay.className = 'modal-overlay fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center px-gutter';

  overlay.innerHTML = `
    <div class="modal-panel bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-[480px] p-xl space-y-lg">
      <div class="flex items-center justify-between">
        <h2 class="font-headline-md text-headline-md text-on-surface">${isCreate ? 'New Task' : 'Edit Task'}</h2>
        <button id="modal-close-btn" class="material-symbols-outlined text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low">close</button>
      </div>

      <form id="task-form" class="space-y-lg">
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Title</label>
          <input id="task-title" type="text" placeholder="Task title..." value="${task ? safe(task.title) : ''}"
            ${!admin ? 'readonly' : ''}
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring ${!admin ? 'opacity-60 cursor-not-allowed bg-surface-container-low' : ''}"
            required />
          ${!admin ? '<p class="text-xs text-outline">Only admins can edit the title.</p>' : ''}
        </div>

        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Description</label>
          <textarea id="task-description" rows="3" placeholder="Task description..."
            class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring resize-none">${task ? safe(task.description) : ''}</textarea>
        </div>

        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Status</label>
          <select id="task-status" class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring">
            ${statusOptions}
          </select>
        </div>

        ${admin ? `
        <div class="space-y-sm">
          <label class="font-label-md text-label-md text-on-surface">Assigned to</label>
          <select id="task-user" class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring">
            ${userOptions}
          </select>
        </div>` : ''}

        <div class="flex gap-md pt-sm">
          <button type="button" id="modal-cancel-btn"
            class="flex-1 py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low">
            Cancel
          </button>
          <button type="submit" id="modal-save-btn"
            class="flex-1 bg-primary hover:opacity-90 text-on-primary py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm">
            <span id="modal-save-text">${isCreate ? 'Create Task' : 'Save Changes'}</span>
            <span id="modal-save-spinner" class="hidden w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

  const escHandler = e => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', escHandler);
  overlay._escHandler = escHandler;

  document.getElementById('task-form').addEventListener('submit', async e => {
    e.preventDefault();
    const saveBtn = document.getElementById('modal-save-btn');
    const saveText = document.getElementById('modal-save-text');
    const spinner = document.getElementById('modal-save-spinner');

    saveBtn.disabled = true;
    saveText.textContent = 'Saving...';
    spinner.classList.remove('hidden');

    try {
      const title = document.getElementById('task-title').value.trim();
      const description = document.getElementById('task-description').value.trim();
      const status = document.getElementById('task-status').value;
      const session = getSession();
      const userId = admin
        ? parseInt(document.getElementById('task-user').value)
        : (task?.userId ?? session?.id);

      if (isCreate) {
        await createTask({ title, description, status: 'todo', userId });
        showToast('Task created!', 'success');
      } else {
        const updates = { description, status };
        if (admin) { updates.title = title; updates.userId = userId; }
        await updateTask(task.id, updates);
        showToast('Task updated!', 'success');
      }

      closeModal();
      if (onSuccess) onSuccess();
    } catch {
      showToast('Failed to save task.', 'error');
      saveBtn.disabled = false;
      saveText.textContent = isCreate ? 'Create Task' : 'Save Changes';
      spinner.classList.add('hidden');
    }
  });
}

export function closeModal() {
  const overlay = document.getElementById('task-modal-overlay');
  if (overlay) {
    if (overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
    overlay.remove();
  }
}

function safe(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}
