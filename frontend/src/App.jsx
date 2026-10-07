import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import Departments from './pages/admin/Departments';
import Projects from './pages/admin/Projects';
import Tasks from './pages/admin/Tasks';
import Reports from './pages/admin/Reports';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProjects from './pages/employee/MyProjects';
import MyTasks from './pages/employee/MyTasks';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Spinner from './components/Spinner';

const RootRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
};

const RoleLayout = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminLayout /> : <EmployeeLayout />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="departments" element={<Departments />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
