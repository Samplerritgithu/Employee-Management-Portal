import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const { stats, myProjects, myTasks } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Your personal dashboard</p>
      </div>

      <div className="stats-grid">
        <StatCard title="My Projects" value={stats.myProjects} accent="blue" />
        <StatCard title="My Tasks" value={stats.myTasks} accent="teal" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} accent="amber" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} accent="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>My Projects</h2>
            <Link to="/projects">View all</Link>
          </div>
          {myProjects?.length === 0 ? (
            <p className="text-muted">No projects assigned</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((proj) => (
                    <tr key={proj._id}>
                      <td>{proj.name}</td>
                      <td>
                        <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
                      </td>
                      <td>{formatDate(proj.startDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>My Tasks</h2>
            <Link to="/tasks">View all</Link>
          </div>
          {myTasks?.length === 0 ? (
            <p className="text-muted">No tasks assigned</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge ${statusClass(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${statusClass(task.status)}`}>{task.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
