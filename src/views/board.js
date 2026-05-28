

import { getTasks, getUsers, updateTask, deleteTask } from '../api.js';
import { getSession, clearSession, isAdmin, getInitials } from '../auth.js';
import { navigate } from '../router.js';
import { createTaskCardHTML } from '../components/taskCard.js';
import { openCreateModal, openEditModal } from '../components/taskModal.js';
import { openUserModal } from '../components/userModal.js';
import { showToast } from '../components/toast.js';

const COLUMNS = [
  { key: 'todo',        label: 'To Do',      badgeClass: 'bg-surface-container-high text-on-surface-variant' },
  { key: 'in progress', label: 'In Progress', badgeClass: 'bg-primary-container text-on-primary' },
  { key: 'in review',   label: 'In Review',   badgeClass: 'bg-surface-container-high text-on-surface-variant' },
  { key: 'done',        label: 'Done',        badgeClass: 'bg-surface-container-high text-on-surface-variant' },
];

function resolveColumn(status) {
  return status === 'pending' ? 'todo' : status;
}

let allTasks = [];
let allUsers = [];
let draggedTaskId = null;


export async function renderBoard(container) {
  const session = getSession();
  container.innerHTML = getBoardHTML(session);
  attachBoardListeners();
  await loadData();
}


async function loadData() {
  try {
    setLoading(true);
    [allTasks, allUsers] = await Promise.all([getTasks(), getUsers()]);
    renderColumns();
  } catch {
    showToast('Cannot reach json-server. Make sure it is running on port 3000.', 'error');
  } finally {
    setLoading(false);
  }
}


function renderColumns() {
  const userMap = {};
  allUsers.forEach(u => { userMap[u.id] = u; });

  const searchEl = document.getElementById('search-input');
  const query = searchEl ? searchEl.value.trim().toLowerCase() : '';

  COLUMNS.forEach(col => {
    const colId = col.key.replaceAll(' ', '-');
    const colContainer = document.getElementById(`column-${colId}`);
    const counter = document.getElementById(`counter-${colId}`);
    if (!colContainer) return;

    let colTasks = allTasks.filter(t => resolveColumn(t.status) === col.key);

    if (query) {
      colTasks = colTasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    if (counter) counter.textContent = colTasks.length;

    colContainer.innerHTML = colTasks.length === 0
      ? `<div class="flex flex-col items-center justify-center py-8 text-on-surface-variant opacity-60">
           <span class="material-symbols-outlined text-[32px] mb-2">inbox</span>
           <p class="font-body-sm text-body-sm">No tasks here</p>
         </div>`
      : colTasks.map(t => createTaskCardHTML(t, userMap[t.userId])).join('');

    colContainer.ondragover = e => {
      e.preventDefault();
      colContainer.style.outline = '2px dashed #7331df';
      colContainer.style.outlineOffset = '4px';
    };

    colContainer.ondragleave = () => {
      colContainer.style.outline = '';
      colContainer.style.outlineOffset = '';
    };

    colContainer.ondrop = async e => {
      e.preventDefault();
      colContainer.style.outline = '';
      colContainer.style.outlineOffset = '';

      if (draggedTaskId === null) return;

      const task = allTasks.find(t => t.id === draggedTaskId);
      if (!task || resolveColumn(task.status) === col.key) {
        draggedTaskId = null;
        return;
      }

      try {
        await updateTask(draggedTaskId, { status: col.key });
        task.status = col.key; 
        renderColumns();       
        showToast('Task moved!', 'success');
      } catch {
        showToast('Failed to move task.', 'error');
      }

      draggedTaskId = null;
    };
  });

  attachCardListeners();
}


function attachCardListeners() {
  document.querySelectorAll('.edit-task-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const task = allTasks.find(t => t.id === parseInt(btn.dataset.taskId));
      if (task) await openEditModal(task, loadData);
    });
  });

  document.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const taskId = parseInt(btn.dataset.taskId);
      if (!confirm('Delete this task?')) return;
      try {
        await deleteTask(taskId);
        allTasks = allTasks.filter(t => t.id !== taskId);
        renderColumns();
        showToast('Task deleted!', 'success');
      } catch {
        showToast('Failed to delete task.', 'error');
      }
    });
  });

  document.querySelectorAll('.task-card').forEach(card => {
    card.draggable = true;

    card.ondragstart = e => {
      draggedTaskId = parseInt(card.dataset.taskId);
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    };

    card.ondragend = () => {
      card.style.opacity = '';
      draggedTaskId = null;
      COLUMNS.forEach(col => {
        const el = document.getElementById(`column-${col.key.replaceAll(' ', '-')}`);
        if (el) { el.style.outline = ''; el.style.outlineOffset = ''; }
      });
    };
  });
}


function attachBoardListeners() {
  const newTaskBtn = document.getElementById('new-task-btn');
  if (newTaskBtn) newTaskBtn.addEventListener('click', () => openCreateModal(loadData));

  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) addUserBtn.addEventListener('click', () => openUserModal());

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      showToast('You have been signed out.', 'info');
      navigate('#/login');
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', renderColumns);
}


function setLoading(loading) {
  if (!loading) return;
  COLUMNS.forEach(col => {
    const el = document.getElementById(`column-${col.key.replaceAll(' ', '-')}`);
    if (!el) return;
    el.innerHTML = [1, 2].map(() => `
      <div class="bg-surface border border-outline-variant rounded-xl p-md animate-pulse">
        <div class="h-4 bg-surface-container-high rounded-full w-1/2 mb-2"></div>
        <div class="h-5 bg-surface-container-high rounded-full w-4/5 mb-2"></div>
        <div class="h-3 bg-surface-container-high rounded-full w-full mb-1"></div>
        <div class="h-3 bg-surface-container-high rounded-full w-3/4 mt-4"></div>
      </div>
    `).join('');
  });
}


function getBoardHTML(session) {
  const admin = isAdmin();
  const initials = getInitials(session?.name || '');

  const navItems = [
    { icon: 'dashboard',  label: 'Dashboard', active: true },
    { icon: 'assignment', label: 'Projects',  active: false },
    { icon: 'group',      label: 'Team',      active: false },
    { icon: 'bar_chart',  label: 'Reports',   active: false },
    { icon: 'settings',   label: 'Settings',  active: false },
  ];

  const navHTML = navItems.map(item => item.active
    ? `<a class="flex items-center bg-primary-fixed text-on-primary-fixed-variant rounded-lg mx-2 px-4 py-3 font-body-sm text-body-sm scale-[0.98]" href="#">
        <span class="material-symbols-outlined mr-3">${item.icon}</span><span>${item.label}</span>
       </a>`
    : `<a class="flex items-center text-secondary hover:text-primary hover:bg-primary-container/10 px-4 py-3 mx-2 font-body-sm text-body-sm rounded-lg transition-all" href="#">
        <span class="material-symbols-outlined mr-3">${item.icon}</span><span>${item.label}</span>
       </a>`
  ).join('');

  const columnsHTML = COLUMNS.map(col => {
    const colId = col.key.replaceAll(' ', '-');
    return `
      <div class="kanban-column flex flex-col w-1/4 h-full">
        <div class="flex items-center justify-between mb-md">
          <div class="flex items-center gap-2">
            <h3 class="font-title-sm text-title-sm text-on-surface">${col.label}</h3>
            <span id="counter-${colId}" class="${col.badgeClass} px-2 py-0.5 rounded-full font-label-sm text-label-sm">0</span>
          </div>
          <button class="material-symbols-outlined text-outline">more_horiz</button>
        </div>
        <div id="column-${colId}" class="flex-1 space-y-md p-2 bg-surface-container-low/50 rounded-xl overflow-y-auto custom-scrollbar">
        </div>
      </div>
    `;
  }).join('');

  const sidebarButtons = admin ? `
    <button id="new-task-btn"
      class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
      <span class="material-symbols-outlined">add</span> New Task
    </button>
    <button id="add-user-btn"
      class="w-full mt-2 bg-surface-container-high text-on-surface py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors">
      <span class="material-symbols-outlined">person_add</span> Add User
    </button>
  ` : `
    <button disabled
      class="w-full bg-surface-container-high text-on-surface-variant py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 cursor-not-allowed opacity-60">
      <span class="material-symbols-outlined">lock</span> New Task
    </button>
  `;

  return `
    <div class="bg-background text-on-background overflow-hidden h-screen flex">

      <aside class="hidden md:flex flex-col pt-md pb-xl gap-xs h-full bg-surface-container-low border-r border-outline-variant w-[280px] shrink-0">
        <div class="px-gutter mb-xl">
          <h1 class="font-headline-md text-headline-md font-bold text-primary">Riwiflow</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Product Team</p>
        </div>
        <nav class="flex-1 space-y-1">${navHTML}</nav>
        <div class="px-4 mt-auto">${sidebarButtons}</div>
      </aside>

      <main class="flex-1 flex flex-col min-w-0">
        <header class="flex justify-between items-center h-16 px-gutter w-full bg-surface border-b border-outline-variant z-40">
          <div class="flex items-center gap-4 flex-1">
            <div class="relative max-w-md w-full">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input id="search-input"
                class="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-full font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search tasks..." type="text" />
            </div>
          </div>
          <div class="flex items-center gap-4 ml-4">
            <button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full">notifications</button>
            <button id="logout-btn"
              class="flex items-center gap-2 text-on-surface-variant hover:text-error hover:bg-surface-container-low px-3 py-2 rounded-full font-label-md text-label-md"
              title="Sign out">
              <span class="material-symbols-outlined text-[20px]">logout</span>
              <span class="hidden sm:inline">Sign out</span>
            </button>
            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-[11px] font-bold border border-outline-variant select-none"
              title="${session?.name || ''}">${initials}</div>
          </div>
        </header>

        <div class="flex-1 overflow-x-auto p-gutter custom-scrollbar">
          <div class="flex gap-gutter h-full">${columnsHTML}</div>
        </div>
      </main>
    </div>
  `;
}
