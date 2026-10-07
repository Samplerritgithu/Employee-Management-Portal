import { useState, useEffect } from 'react';
import projectService from '../../services/projectService';
import employeeService from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const emptyForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'PLANNED',
  manager: '',
  members: [],
};

const Projects = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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

  const openEdit = (proj) => {
    setEditing(proj);
    setForm({
      name: proj.name,
      description: proj.description || '',
      startDate: proj.startDate ? proj.startDate.slice(0, 10) : '',
      endDate: proj.endDate ? proj.endDate.slice(0, 10) : '',
      status: proj.status,
      manager: proj.manager?._id || '',
      members: (proj.members || []).map((m) => m._id || m),
    });
    setModalOpen(true);
  };

  const toggleMember = (id) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        manager: form.manager || null,
        endDate: form.endDate || null,
      };
      if (editing) {
        await projectService.updateProject(editing._id, payload);
        showToast('Project updated successfully');
      } else {
        await projectService.createProject(payload);
        showToast('Project created successfully');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteId);
      showToast('Project deleted successfully');
      setDeleteId(null);
      fetchProjects();
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
          <h1>Projects</h1>
          <p>Create and manage projects</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Project
        </button>
      </div>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error} onRetry={fetchProjects} />}
      {!loading && !error && projects.length === 0 && (
        <EmptyState
          message="No projects yet"
          action={
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add Project
            </button>
          }
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Manager</th>
                <th>Members</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj._id}>
                  <td>
                    <strong>{proj.name}</strong>
                    {proj.description && (
                      <p className="text-muted text-sm">{proj.description.slice(0, 60)}</p>
                    )}
                  </td>
                  <td>{proj.manager?.name || '—'}</td>
                  <td>{proj.members?.length || 0}</td>
                  <td>
                    <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
                  </td>
                  <td>{formatDate(proj.startDate)}</td>
                  <td>{formatDate(proj.endDate)}</td>
                  <td>
                    <div className="action-btns">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(proj)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(proj._id)}
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
        title={editing ? 'Edit Project' : 'Add Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full">
            <label>Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            <label>Start Date *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
          <div className="form-group">
            <label>Manager</label>
            <select
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
            >
              <option value="">Select manager</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label>Assign Members</label>
            <div className="checkbox-list">
              {employees.length === 0 ? (
                <p className="text-muted">No employees available</p>
              ) : (
                employees.map((emp) => (
                  <label key={emp._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.members.includes(emp._id)}
                      onChange={() => toggleMember(emp._id)}
                    />
                    {emp.name} {emp.position ? `(${emp.position})` : ''}
                  </label>
                ))
              )}
            </div>
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
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        loading={deleting}
      />
    </div>
  );
};

export default Projects;
