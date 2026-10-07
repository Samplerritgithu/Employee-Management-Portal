import { useState, useEffect } from 'react';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import employeeService from '../../services/employeeService';
import notificationService from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const emptyForm = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
};

const Tasks = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await taskService.getTasks(statusFilter ? { status: statusFilter } : {});
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  useEffect(() => {
    projectService.getProjects().then((res) => setProjects(res.data || [])).catch(() => {});
    employeeService
      .getEmployees({ limit: 100, role: 'EMPLOYEE' })
      .then((res) => setEmployees(res.data || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        project: form.project || null,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };
      if (editing) {
        await taskService.updateTask(editing._id, payload);
        showToast('Task updated successfully');
      } else {
        await taskService.createTask(payload);
        showToast('Task created successfully');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteId);
      showToast('Task deleted successfully');
      setDeleteId(null);
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAnnounce = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await notificationService.createAnnouncement(announcement);
      showToast('Announcement sent');
      setAnnounceOpen(false);
      setAnnouncement('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header row">
        <div>
          <h1>Tasks</h1>
          <p>Create and assign tasks</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-outline" onClick={() => setAnnounceOpen(true)}>
            Announcement
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add Task
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error} onRetry={fetchTasks} />}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          message="No tasks yet"
          action={
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add Task
            </button>
          }
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.project?.name || '—'}</td>
                  <td>{task.assignedTo?.name || '—'}</td>
                  <td>
                    <span className={`badge ${statusClass(task.priority)}`}>{task.priority}</span>
                  </td>
                  <td>
                    <span className={`badge ${statusClass(task.status)}`}>{task.status}</span>
                  </td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <div className="action-btns">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(task)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(task._id)}
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
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Task' : 'Add Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full">
            <label>Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-group full">
            <label>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Project</label>
            <select
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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

      <Modal isOpen={announceOpen} onClose={() => setAnnounceOpen(false)} title="Send Announcement">
        <form onSubmit={handleAnnounce}>
          <div className="form-group">
            <label>Message *</label>
            <textarea
              required
              rows={4}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Important announcement for all employees..."
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setAnnounceOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        loading={deleting}
      />
    </div>
  );
};

export default Tasks;
