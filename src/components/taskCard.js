
import { isAdmin, getSession } from '../auth.js';

const STATUS_COLORS = {
  'todo':        'bg-purple-100 text-purple-700',
  'pending':     'bg-purple-100 text-purple-700',
  'in progress': 'bg-blue-100 text-blue-700',
  'in review':   'bg-yellow-100 text-yellow-700',
  'done':        'bg-green-100 text-green-700',
};

const STATUS_LABELS = {
  'todo':        'To Do',
  'pending':     'To Do',
  'in progress': 'In Progress',
  'in review':   'In Review',
  'done':        'Done',
};

export function createTaskCardHTML(task, assignedUser) {
  const session = getSession();
  const admin = isAdmin();
  const isOwner = session && task.userId === session.id;
  const canEdit = admin || isOwner;

  const initials = assignedUser
    ? assignedUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const isDone = task.status === 'done';

  const editBtn = canEdit
    ? `<button class="edit-task-btn text-gray-400 hover:text-purple-600" data-task-id="${task.id}" title="Edit">
        <span class="material-symbols-outlined" style="font-size:18px">edit</span>
       </button>`
    : '';

  const deleteBtn = admin
    ? `<button class="delete-task-btn text-gray-400 hover:text-red-500" data-task-id="${task.id}" title="Delete">
        <span class="material-symbols-outlined" style="font-size:18px">delete</span>
       </button>`
    : '';

  return `
    <div class="task-card bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab ${isDone ? 'opacity-70' : ''}"
      data-task-id="${task.id}" style="user-select:none">

      <div class="mb-2">
        <span class="${STATUS_COLORS[task.status] || STATUS_COLORS['todo']} text-xs font-semibold px-2 py-0.5 rounded-full">
          ${STATUS_LABELS[task.status] || task.status}
        </span>
      </div>

      <p class="text-sm font-semibold mb-1 ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}">
        ${safe(task.title)}
      </p>

      <p class="text-xs text-gray-500 mb-3 line-clamp-2">${safe(task.description)}</p>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold border border-purple-200">
            ${initials}
          </div>
          <span class="text-xs text-gray-400 truncate max-w-[80px]">
            ${assignedUser ? safe(assignedUser.name) : 'Unassigned'}
          </span>
        </div>
        <div class="flex items-center gap-1">
          ${editBtn}
          ${deleteBtn}
        </div>
      </div>
    </div>
  `;
}

function safe(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}
