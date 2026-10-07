import api from './api';

const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export default authService;
