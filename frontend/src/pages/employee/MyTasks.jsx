import { useState, useEffect } from 'react';
import taskService from '../../services/taskService';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const MyTasks = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await taskService.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    setUpdating(taskId);
    try {
      await taskService.updateTask(taskId, { status });
      showToast('Task status updated');
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchTasks} />;

  return (
    <div>
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>Update status on tasks assigned to you</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState message="No tasks assigned yet" />
      ) : (
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description && (
                      <p className="text-muted text-sm">{task.description.slice(0, 80)}</p>
                    )}
                  </td>
                  <td>{task.project?.name || '—'}</td>
                  <td>
                    <span className={`badge ${statusClass(task.priority)}`}>{task.priority}</span>
                  </td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <select
                      value={task.status}
                      disabled={updating === task._id}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
