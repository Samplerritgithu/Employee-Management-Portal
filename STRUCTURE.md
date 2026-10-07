# Project Structure — Pages & Folders Guide

This document explains what every major folder and page does in the Employee Management System.

---

## Root

| Item | Purpose |
|------|---------|
| `backend/` | Express + MongoDB API server |
| `frontend/` | React (Vite) client application |
| `README.md` | Setup, install, and run instructions |
| `STRUCTURE.md` | This file — folder & page reference |
| `.gitignore` | Ignores `node_modules`, `.env`, uploads, build output |

---

## Backend (`backend/`)

### Folders

| Folder | What it does |
|--------|----------------|
| `config/` | App configuration. `db.js` connects MongoDB via Mongoose. |
| `controllers/` | Handle HTTP requests/responses. Call services, return JSON. No heavy business logic here. |
| `models/` | Mongoose schemas (Employee, Department, Project, Task, Notification). |
| `routes/` | Express routers that map URLs → middleware → controllers. |
| `services/` | Business logic (CRUD, filters, notifications, dashboards). |
| `middleware/` | Auth, admin checks, validation, Multer uploads, error handler. |
| `utils/` | Helpers: `AppError`, `asyncHandler`, `apiResponse`, validators. |
| `scripts/` | One-off seed scripts (admin user, default departments). |
| `uploads/` | Stored profile images (served statically at `/uploads`). |

### Key files

| File | What it does |
|------|----------------|
| `server.js` | Starts Express, CORS, routes, static uploads, error middleware. |
| `package.json` | Backend deps and scripts (`dev`, `seed`, `seed:departments`). |
| `.env` / `.env.example` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`. |

### Controllers (by feature)

| File | Responsibility |
|------|----------------|
| `authController.js` | Register, login, get current user (`/me`). |
| `employeeController.js` | Admin employee CRUD + list with search/filter/pagination. |
| `departmentController.js` | Create/list/update/delete departments. |
| `projectController.js` | Project CRUD, assign/remove members. |
| `taskController.js` | Task CRUD; employees may update own task status. |
| `profileController.js` | Get/update own profile; upload profile image. |
| `notificationController.js` | List notifications, mark read, admin announcements. |
| `dashboardController.js` | Role-based dashboard stats (admin vs employee). |

### Models

| Model | Stores |
|-------|--------|
| `Employee` | Users (ADMIN / EMPLOYEE): name, email, password, role, status, etc. |
| `Department` | Org units (IT, HR, Finance, …). |
| `Project` | Projects with manager, members, status dates. |
| `Task` | Tasks linked to project + assignee, priority/status. |
| `Notification` | In-app messages for employees/admins. |

### Middleware

| File | What it does |
|------|----------------|
| `authMiddleware.js` | Verifies JWT, loads user → `req.user`; `adminMiddleware` blocks non-admins (403). |
| `uploadMiddleware.js` | Multer config: jpg/jpeg/png/webp, size limits. |
| `validate.js` | Runs express-validator results and returns 400 errors. |
| `errorMiddleware.js` | Central error responses (`success: false`, status codes). |

### Scripts

| Script | What it does |
|--------|----------------|
| `seedAdmin.js` | Creates `admin@example.com` / `Admin@123` (hashed password). |
| `seedDepartments.js` | Seeds IT, HR, Finance, Marketing, Sales, Operations. |

---

## Frontend (`frontend/`)

### Folders

| Folder | What it does |
|--------|----------------|
| `src/components/` | Reusable UI pieces (Modal, Pagination, Spinner, ProtectedRoute, …). |
| `src/pages/` | Full screens for each route (login, admin, employee, profile). |
| `src/layouts/` | Shell with sidebar + navbar for Admin and Employee. |
| `src/context/` | Global React state: auth + toast notifications. |
| `src/services/` | Axios API wrappers (auth, employees, projects, …). |
| `src/hooks/` | Custom hooks (e.g. `useDebounce` for search). |
| `src/utils/` | Small helpers (date format, badges, initials). |
| `public/` | Static public assets for Vite. |
| `dist/` | Production build output (`npm run build`). |

### Core app files

| File | What it does |
|------|----------------|
| `main.jsx` | React entry — mounts `<App />` and loads CSS. |
| `App.jsx` | React Router: public, admin, and employee routes. |
| `index.css` | Global theme (navy blue), layout, forms, tables, auth UI. |
| `vite.config.js` | Vite + React plugin config. |
| `.env` | `VITE_API_URL` pointing at the backend API. |

---

## Pages — what each screen does

### Public pages

| Route | Page file | What it does |
|-------|-----------|--------------|
| `/login` | `pages/Login.jsx` | Email/password login. Stores JWT and redirects by role. |
| `/register` | `pages/Register.jsx` | Self-registration (name, email, password, department, position). |

### Admin pages (`/admin/*`) — Admin only

| Route | Page file | What it does |
|-------|-----------|--------------|
| `/admin/dashboard` | `pages/admin/AdminDashboard.jsx` | Stats cards: employees, departments, projects, tasks; recent lists. |
| `/admin/employees` | `pages/admin/Employees.jsx` | Employee table with search, filters, pagination; create/edit/delete. |
| `/admin/employees/:id` | `pages/admin/EmployeeDetail.jsx` | Single employee profile view (admin). |
| `/admin/departments` | `pages/admin/Departments.jsx` | Manage departments (create, edit, delete). |
| `/admin/projects` | `pages/admin/Projects.jsx` | Create/edit projects; assign/remove employees. |
| `/admin/tasks` | `pages/admin/Tasks.jsx` | Create/assign tasks; change status; send announcements. |
| `/admin/reports` | `pages/admin/Reports.jsx` | Higher-level reports/statistics view for admins. |

### Employee / shared pages

| Route | Page file | What it does |
|-------|-----------|--------------|
| `/dashboard` | `pages/employee/EmployeeDashboard.jsx` | Personal stats: my projects, my tasks, pending/completed. |
| `/projects` | `pages/employee/MyProjects.jsx` | Projects assigned to the logged-in employee. |
| `/tasks` | `pages/employee/MyTasks.jsx` | Assigned tasks; employee can update status (TODO → IN_PROGRESS → COMPLETED). |
| `/profile` | `pages/Profile.jsx` | View/update name, phone, address, profile image. Cannot change role/salary/status. |
| `/notifications` | `pages/Notifications.jsx` | Full notification list; mark as read. |

---

## Layouts

| Layout | Used by | What it does |
|--------|---------|--------------|
| `AdminLayout.jsx` | All `/admin/*` (+ shared profile/notifications when admin) | Navy sidebar: Dashboard, Employees, Departments, Projects, Tasks, Reports, Profile, Notifications. |
| `EmployeeLayout.jsx` | Employee portal routes | Simpler navy sidebar: Dashboard, My Projects, My Tasks, Profile, Notifications. |

Both layouts include the top navbar (menu toggle, notification bell, user info, logout).

---

## Components

| Component | What it does |
|-----------|----------------|
| `ProtectedRoute.jsx` | Redirects unauthenticated users to `/login`; blocks employees from `/admin/*`. |
| `NotificationBell.jsx` | Navbar dropdown of recent notifications + unread count. |
| `Pagination.jsx` | Previous / page numbers / Next for employee list. |
| `Modal.jsx` | Reusable modal dialog wrapper. |
| `ConfirmDialog.jsx` | Confirm before delete actions. |
| `StatCard.jsx` | Dashboard metric card. |
| `LoadingState.jsx` / `EmptyState.jsx` / `ErrorState.jsx` | Standard loading, empty, and error UI. |
| `Spinner.jsx` | Loading spinner. |

---

## Context & services

| File | What it does |
|------|----------------|
| `AuthContext.jsx` | Login/register/logout, current user, `isAdmin`, token in `localStorage`. |
| `ToastContext.jsx` | Global success/error toast messages. |
| `services/api.js` | Shared Axios instance: `baseURL`, JWT header, error handling. |
| `*Service.js` | One service per domain (auth, employee, department, project, task, profile, notification, dashboard). |

---

## UI theme note

Colors live in `frontend/src/index.css` under `:root`.

- **Primary / sidebar:** navy (`#0a1628`, `#1a365d`)
- **Accent / active links / buttons:** blue (`#2b6cb0`)
- **Background:** light blue-gray (`#eef2f8`)

Change those CSS variables to retheme the whole app.
