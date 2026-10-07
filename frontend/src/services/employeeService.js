import api from './api';

const employeeService = {
  getEmployees: async (params = {}) => {
    const { data } = await api.get('/employees', { params });
    return data;
  },

  getEmployee: async (id) => {
    const { data } = await api.get(`/employees/${id}`);
    return data;
  },

  createEmployee: async (employeeData) => {
    const { data } = await api.post('/employees', employeeData);
    return data;
  },

  updateEmployee: async (id, employeeData) => {
    const { data } = await api.put(`/employees/${id}`, employeeData);
    return data;
  },

  deleteEmployee: async (id) => {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  },
};

export default employeeService;
