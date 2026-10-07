import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import useDebounce from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  position: '',
  salary: '',
  joiningDate: '',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  address: '',
};

const Employees = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', role: '', status: '', position: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        department: filters.department || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        position: filters.position || undefined,
      };
      const res = await employeeService.getEmployees(params);
      setEmployees(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    departmentService.getDepartments().then((res) => setDepartments(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      password: '',
      phone: emp.phone || '',
      department: emp.department?._id || emp.department || '',
      position: emp.position || '',
      salary: emp.salary ?? '',
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
      role: emp.role || 'EMPLOYEE',
      status: emp.status || 'ACTIVE',
      address: emp.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        salary: form.salary === '' ? 0 : Number(form.salary),
        department: form.department || null,
        joiningDate: form.joiningDate || undefined,
      };
      if (!payload.password) delete payload.password;

      if (editing) {
        await employeeService.updateEmployee(editing._id, payload);
        showToast('Employee updated successfully');
      } else {
        if (!payload.password) payload.password = 'Employee@123';
        await employeeService.createEmployee(payload);
        showToast('Employee created successfully');
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(deleteId);
      showToast('Employee deleted successfully');
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header row">
        <div>
          <h1>Employees</h1>
          <p>Manage organization employees</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Employee
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
        <input
          type="text"
          placeholder="Filter by position"
          value={filters.position}
          onChange={(e) => setFilters({ ...filters, position: e.target.value })}
        />
      </div>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error} onRetry={fetchEmployees} />}
      {!loading && !error && employees.length === 0 && (
        <EmptyState message="No employees found" action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>Add Employee</button>
        } />
      )}

      {!loading && !error && employees.length > 0 && (
        <>
          <div className="table-wrap panel">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <Link to={`/admin/employees/${emp._id}`}>{emp.name}</Link>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department?.name || '—'}</td>
                    <td>{emp.position || '—'}</td>
                    <td>
                      <span className={`badge ${statusClass(emp.status)}`}>{emp.status}</span>
                    </td>
                    <td>{formatDate(emp.joiningDate)}</td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/admin/employees/${emp._id}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(emp)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(emp._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{editing ? 'Password (leave blank to keep)' : 'Password'}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editing ? '••••••••' : 'Default: Employee@123'}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              min="0"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="form-actions full">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default Employees;
