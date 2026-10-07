import { useState, useEffect } from 'react';
import departmentService from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const Departments = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await departmentService.getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description || '',
      status: dept.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await departmentService.updateDepartment(editing._id, form);
        showToast('Department updated successfully');
      } else {
        await departmentService.createDepartment(form);
        showToast('Department created successfully');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentService.deleteDepartment(deleteId);
      showToast('Department deleted successfully');
      setDeleteId(null);
      fetchDepartments();
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
          <h1>Departments</h1>
          <p>Manage organization departments</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add Department
        </button>
      </div>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error} onRetry={fetchDepartments} />}
      {!loading && !error && departments.length === 0 && (
        <EmptyState
          message="No departments yet"
          action={
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Add Department
            </button>
          }
        />
      )}

      {!loading && !error && departments.length > 0 && (
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td>{dept.name}</td>
                  <td>{dept.description || '—'}</td>
                  <td>{dept.manager?.name || '—'}</td>
                  <td>
                    <span className={`badge ${statusClass(dept.status)}`}>{dept.status}</span>
                  </td>
                  <td>{formatDate(dept.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(dept)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(dept._id)}
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
        title={editing ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
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
        title="Delete Department"
        message="Are you sure you want to delete this department?"
        loading={deleting}
      />
    </div>
  );
};

export default Departments;
