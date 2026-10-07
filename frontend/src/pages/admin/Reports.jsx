import { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const Reports = () => {
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

  const { stats, taskStats } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Organization statistics and insights</p>
      </div>

      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-header">
          <h2>Workforce Overview</h2>
        </div>
        <div className="stats-grid">
          <StatCard title="Total Employees" value={stats.totalEmployees} accent="blue" />
          <StatCard title="Active Employees" value={stats.activeEmployees} accent="green" />
          <StatCard title="Departments" value={stats.departments} accent="teal" />
          <StatCard title="Projects" value={stats.projects} accent="orange" />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Task Overview</h2>
        </div>
        <div className="stats-grid">
          <StatCard title="Pending Tasks" value={stats.pendingTasks} accent="amber" />
          <StatCard title="In Progress" value={taskStats?.inProgress} accent="orange" />
          <StatCard title="Completed Tasks" value={stats.completedTasks} accent="green" />
        </div>

        {taskStats?.byPriority && Object.keys(taskStats.byPriority).length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 className="section-subtitle">Tasks by Priority</h3>
            <div className="stats-grid stats-compact">
              {Object.entries(taskStats.byPriority).map(([priority, count]) => (
                <StatCard key={priority} title={priority} value={count} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Reports;
