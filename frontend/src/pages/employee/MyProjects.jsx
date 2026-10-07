import { useState, useEffect } from 'react';
import projectService from '../../services/projectService';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass } from '../../utils/helpers';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <div>
      <div className="page-header">
        <h1>My Projects</h1>
        <p>Projects assigned to you</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects assigned yet" />
      ) : (
        <div className="card-grid">
          {projects.map((proj) => (
            <div key={proj._id} className="info-card">
              <div className="info-card-header">
                <h3>{proj.name}</h3>
                <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
              </div>
              <p className="text-muted">{proj.description || 'No description'}</p>
              <div className="info-card-meta">
                <span>Manager: {proj.manager?.name || '—'}</span>
                <span>Start: {formatDate(proj.startDate)}</span>
                <span>End: {formatDate(proj.endDate)}</span>
                <span>Members: {proj.members?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
