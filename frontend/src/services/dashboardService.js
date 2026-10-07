import api from './api';

const dashboardService = {
  getDashboard: async () => {
    const { data } = await api.get('/dashboard');
    return data;
  },
};

export default dashboardService;
