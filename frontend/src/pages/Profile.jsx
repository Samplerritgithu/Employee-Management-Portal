import { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import departmentService from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatDate, statusClass, getImageUrl, getInitials } from '../utils/helpers';

const Profile = () => {
  const { updateUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', department: '' });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileService.getProfile();
      setProfile(res.data);
      setForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        department: res.data.department?._id || '',
      });
      updateUser(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    departmentService
      .getDepartments({ status: 'ACTIVE' })
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileService.updateProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
        department: form.department || null,
      });
      setProfile(res.data);
      updateUser(res.data);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only jpg, jpeg, png, and webp images are allowed', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be under 2MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await profileService.uploadImage(file);
      setProfile(res.data);
      updateUser(res.data);
      showToast('Profile image updated');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;
  if (!profile) return null;

  const imageUrl = getImageUrl(profile.profileImage);

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and update your profile information</p>
      </div>

      <div className="profile-layout">
        <div className="panel profile-side">
          <div className="profile-avatar-section">
            {imageUrl ? (
              <img src={imageUrl} alt={profile.name} className="profile-avatar-lg" />
            ) : (
              <div className="profile-avatar-lg initials">{getInitials(profile.name)}</div>
            )}
            <label className="btn btn-outline btn-sm upload-btn">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                hidden
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            <span className={`badge ${statusClass(profile.status)}`}>{profile.status}</span>
          </div>

          <div className="readonly-fields">
            <div className="detail-item">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            <div className="detail-item">
              <label>Role</label>
              <p>{profile.role}</p>
            </div>
            <div className="detail-item">
              <label>Position</label>
              <p>{profile.position || '—'}</p>
            </div>
            <div className="detail-item">
              <label>Joining Date</label>
              <p>{formatDate(profile.joiningDate)}</p>
            </div>
            {isAdmin && (
              <div className="detail-item">
                <label>Salary</label>
                <p>{profile.salary != null ? `₹${profile.salary.toLocaleString()}` : '—'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel profile-form-panel">
          <h2>Edit Profile</h2>
          <p className="text-muted text-sm">You can update name, phone, address, and department.</p>
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group full">
              <label>Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full">
              <label>Address</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="form-actions full">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
