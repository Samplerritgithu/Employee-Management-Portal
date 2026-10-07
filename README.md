# Employee Management System (MERN)

A full-stack Employee Management System for managing employees, departments, projects, tasks, and notifications with role-based access control.

## 1. Project Overview

Organizations can manage their workforce through an Admin panel, while employees use a personal portal to view projects, update task status, and manage their profile.

**Roles**

| Role | Access |
|------|--------|
| `ADMIN` | Full CRUD on employees, departments, projects, tasks; dashboards & reports |
| `EMPLOYEE` | Personal dashboard, profile, assigned projects/tasks, notifications |

## 2. Technologies

**Frontend:** React (Vite), JavaScript, React Router, Axios, Context API, CSS

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, dotenv, CORS, express-validator

## 3. Folder Structure

```text
employee-management/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── services/
    ├── config/
    ├── uploads/
    ├── utils/
    ├── scripts/
    ├── server.js
    └── package.json
```

## 4. Installation

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### Clone / open the project

```bash
cd employee-management
```

## 5. MongoDB Setup

**Local MongoDB**

1. Install and start MongoDB.
2. Default URI used in `.env`:

```env
MONGO_URI=mongodb://localhost:27017/employee_management
```

**MongoDB Atlas**

Replace `MONGO_URI` with your Atlas connection string.

## 6. Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Copy from example:

```bash
cd backend
cp .env.example .env
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
cd frontend
cp .env.example .env
```

> Never commit `.env` files. Use `.env.example` as a template.

## 7. Backend Setup

```bash
cd backend
npm install
npm run seed
npm run seed:departments
npm run dev
```

Server runs at **http://localhost:5000**

## 8. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

## 9. Seed Admin

```bash
cd backend
npm run seed
```

Default admin credentials:

```text
Email:    admin@example.com
Password: Admin@123
Role:     ADMIN
```

Password is hashed with bcrypt before storage.

Seed default departments (IT, HR, Finance, Marketing, Sales, Operations):

```bash
npm run seed:departments
```

## 10. Running the Project

Open two terminals:

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 and log in with the seeded admin.

## 11. API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register employee |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Current user |

### Employees (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employees` | Create employee |
| GET | `/api/employees` | List (search, filter, paginate) |
| GET | `/api/employees/:id` | Get one |
| PUT | `/api/employees/:id` | Update |
| DELETE | `/api/employees/:id` | Delete |

Query examples:

```text
GET /api/employees?search=developer
GET /api/employees?department=<id>&status=ACTIVE
GET /api/employees?page=1&limit=10
```

### Departments

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/departments` | Public (for registration) |
| POST / PUT / DELETE | `/api/departments` | Admin |

### Projects

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | Auth (own for employees) |
| POST / PUT / DELETE | `/api/projects` | Admin |
| POST | `/api/projects/:id/members` | Admin |
| DELETE | `/api/projects/:id/members/:memberId` | Admin |

### Tasks

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/tasks` | Auth (own for employees) |
| PUT | `/api/tasks/:id` | Auth (employees: status only) |
| POST / DELETE | `/api/tasks` | Admin |

### Profile

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/profile` | Auth |
| PUT | `/api/profile` | Auth |
| POST | `/api/profile/upload` | Auth (multipart) |

### Notifications

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/notifications` | Auth |
| PUT | `/api/notifications/:id/read` | Auth |
| PUT | `/api/notifications/read-all` | Auth |
| POST | `/api/notifications/announcement` | Admin |

### Dashboard

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/dashboard` | Auth (role-specific data) |

## 12. Authentication Flow

```text
React Login Form
       ↓
Axios POST /api/auth/login
       ↓
Auth Controller → verify password (bcrypt)
       ↓
Generate JWT { userId, role }
       ↓
Store token in localStorage + AuthContext
       ↓
Redirect to Admin or Employee Dashboard
```

Subsequent requests send:

```text
Authorization: Bearer <token>
```

## 13. Role-Based Authorization

```text
GET /api/employees
       ↓
authMiddleware   (verify JWT, attach req.user)
       ↓
adminMiddleware  (require role === ADMIN)
       ↓
employeeController
```

If an employee hits an admin route:

```json
{
  "success": false,
  "message": "Access denied"
}
```

HTTP status: **403**

Frontend also protects `/admin/*` routes and redirects employees to `/dashboard`.

## Frontend Routes

| Path | Role |
|------|------|
| `/login`, `/register` | Public |
| `/admin/dashboard` | Admin |
| `/admin/employees` | Admin |
| `/admin/employees/:id` | Admin |
| `/admin/departments` | Admin |
| `/admin/projects` | Admin |
| `/admin/tasks` | Admin |
| `/admin/reports` | Admin |
| `/dashboard` | Employee |
| `/projects` | Employee |
| `/tasks` | Employee |
| `/profile` | Auth |
| `/notifications` | Auth |

## API Response Format

**Success**

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Paginated**

```json
{
  "success": true,
  "message": "Employees retrieved",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Security

- Passwords hashed with bcryptjs (never stored plain text)
- JWT authentication
- Admin authorization middleware
- CORS restricted to client URL
- Input validation with express-validator
- ObjectId validation
- Multer file type/size limits (jpg/jpeg/png/webp, max 2MB)
- Password field excluded from API responses (`select: false` + `toJSON`)

## License

MIT
