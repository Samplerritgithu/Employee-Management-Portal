import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { formatDate } from '../utils/helpers';

const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  return (
    <div>
      <div className="page-header row">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-outline" onClick={handleMarkAll}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState message="No notifications yet" />
      ) : (
        <div className="notifications-list panel">
          {notifications.map((n) => (
            <button
              key={n._id}
              type="button"
              className={`notification-row ${n.isRead ? '' : 'unread'}`}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
            >
              <div>
                <p>{n.message}</p>
                <span className="text-muted text-sm">
                  {n.type} · {formatDate(n.createdAt)}
                </span>
              </div>
              {!n.isRead && <span className="unread-dot" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
