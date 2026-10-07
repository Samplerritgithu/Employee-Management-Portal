import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { formatDate, statusClass, getImageUrl, getInitials } from '../../utils/helpers';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployee = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeService.getEmployee(id);
      setEmployee(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchEmployee} />;
  if (!employee) return null;

  const imageUrl = getImageUrl(employee.profileImage);

  return (
    <div>
      <div className="page-header row">
        <div>
          <Link to="/admin/employees" className="back-link">
            ← Back to Employees
          </Link>
          <h1>{employee.name}</h1>
          <p>Employee details</p>
        </div>
      </div>

      <div className="profile-card panel">
        <div className="profile-avatar-section">
          {imageUrl ? (
            <img src={imageUrl} alt={employee.name} className="profile-avatar-lg" />
          ) : (
            <div className="profile-avatar-lg initials">{getInitials(employee.name)}</div>
          )}
          <span className={`badge ${statusClass(employee.status)}`}>{employee.status}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{employee.name}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{employee.email}</p>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <p>{employee.phone || '—'}</p>
          </div>
          <div className="detail-item">
            <label>Department</label>
            <p>{employee.department?.name || '—'}</p>
          </div>
          <div className="detail-item">
            <label>Position</label>
            <p>{employee.position || '—'}</p>
          </div>
          <div className="detail-item">
            <label>Salary</label>
            <p>{employee.salary != null ? `₹${employee.salary.toLocaleString()}` : '—'}</p>
          </div>
          <div className="detail-item">
            <label>Joining Date</label>
            <p>{formatDate(employee.joiningDate)}</p>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <p>{employee.role}</p>
          </div>
          <div className="detail-item full">
            <label>Address</label>
            <p>{employee.address || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
