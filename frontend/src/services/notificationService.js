import api from './api';

const notificationService = {
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  createAnnouncement: async (message) => {
    const { data } = await api.post('/notifications/announcement', { message });
    return data;
  },
};

export default notificationService;
