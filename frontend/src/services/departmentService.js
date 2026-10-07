import api from './api';

const departmentService = {
  getDepartments: async (params = {}) => {
    const { data } = await api.get('/departments', { params });
    return data;
  },

  getDepartment: async (id) => {
    const { data } = await api.get(`/departments/${id}`);
    return data;
  },

  createDepartment: async (deptData) => {
    const { data } = await api.post('/departments', deptData);
    return data;
  },

  updateDepartment: async (id, deptData) => {
    const { data } = await api.put(`/departments/${id}`, deptData);
    return data;
  },

  deleteDepartment: async (id) => {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  },
};

export default departmentService;
