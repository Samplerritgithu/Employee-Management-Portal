import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { formatDate } from '../utils/helpers';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silent fail for navbar
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <button
                  key={n._id}
                  type="button"
                  className={`notification-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleMarkRead(n._id)}
                >
                  <p>{n.message}</p>
                  <span>{formatDate(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
