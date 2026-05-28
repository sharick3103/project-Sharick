# RiwiFlow — Kanban SPA

A beginner-friendly Kanban board built as a SPA (Single Page Application) using vanilla JavaScript and json-server.

## Project Structure

```
kanban/
├── index.html              ← Main HTML file (styles + entry point)
├── db.json                 ← json-server database
├── package.json
└── src/
    ├── app.js              ← Starts the router
    ├── router.js           ← Hash-based SPA routing (#/login, #/board)
    ├── auth.js             ← Session management (localStorage)
    ├── api.js              ← All fetch calls to json-server
    ├── views/
    │   ├── login.js        ← Login page
    │   └── board.js        ← Kanban board (drag & drop)
    └── components/
        ├── taskCard.js     ← Task card HTML
        ├── taskModal.js    ← Create/edit task modal
        ├── userModal.js    ← Add user modal (admin only)
        └── toast.js        ← Toast notifications
```

## How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start json-server (API)
```bash
npm run server
```
The API will be available at `http://localhost:3000`

### 3. Open the app
Open `index.html` in your browser.
> Use a local server like VS Code Live Server or `npx serve .`

## Test Credentials

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@riwi.io    | admin123   |
| Coder | coder@riwi.io    | coder123   |

## Role Permissions

| Feature          | Admin | Coder |
|------------------|-------|-------|
| View all tasks   | ✅    | ✅    |
| Create tasks     | ✅    | ❌    |
| Edit any task    | ✅    | ❌    |
| Edit own tasks   | ✅    | ✅    |
| Delete tasks     | ✅    | ❌    |
| Add users        | ✅    | ❌    |
| Drag & drop      | ✅    | ✅    |

## Kanban Columns

`todo` → `in progress` → `in review` → `done`

# Sharick Olmos