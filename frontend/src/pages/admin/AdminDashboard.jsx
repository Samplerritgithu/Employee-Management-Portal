import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const AdminDashboard = () => {
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

  const { stats, recentEmployees, recentProjects, taskStats } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your organization</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Employees" value={stats.totalEmployees} accent="blue" />
        <StatCard title="Active Employees" value={stats.activeEmployees} accent="green" />
        <StatCard title="Departments" value={stats.departments} accent="teal" />
        <StatCard title="Projects" value={stats.projects} accent="orange" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} accent="amber" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} accent="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Recent Employees</h2>
            <Link to="/admin/employees">View all</Link>
          </div>
          {recentEmployees?.length === 0 ? (
            <p className="text-muted">No employees yet</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <Link to={`/admin/employees/${emp._id}`}>{emp.name}</Link>
                      </td>
                      <td>{emp.department?.name || '—'}</td>
                      <td>
                        <span className={`badge ${statusClass(emp.status)}`}>{emp.status}</span>
                      </td>
                      <td>{formatDate(emp.joiningDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent Projects</h2>
            <Link to="/admin/projects">View all</Link>
          </div>
          {recentProjects?.length === 0 ? (
            <p className="text-muted">No projects yet</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Manager</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((proj) => (
                    <tr key={proj._id}>
                      <td>{proj.name}</td>
                      <td>{proj.manager?.name || '—'}</td>
                      <td>
                        <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header">
          <h2>Task Statistics</h2>
        </div>
        <div className="stats-grid stats-compact">
          <StatCard title="Pending" value={taskStats?.pending} />
          <StatCard title="In Progress" value={taskStats?.inProgress} />
          <StatCard title="Completed" value={taskStats?.completed} />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
