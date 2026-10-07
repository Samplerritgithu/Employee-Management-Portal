export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${path}`;
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const statusClass = (status) => {
  const map = {
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-danger',
    ON_LEAVE: 'badge-warning',
    PLANNED: 'badge-info',
    IN_PROGRESS: 'badge-warning',
    COMPLETED: 'badge-success',
    ON_HOLD: 'badge-muted',
    TODO: 'badge-info',
    LOW: 'badge-muted',
    MEDIUM: 'badge-info',
    HIGH: 'badge-warning',
    URGENT: 'badge-danger',
  };
  return map[status] || 'badge-muted';
};
