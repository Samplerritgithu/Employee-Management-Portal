import api from './api';

const projectService = {
  getProjects: async () => {
    const { data } = await api.get('/projects');
    return data;
  },

  getProject: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  createProject: async (projectData) => {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  updateProject: async (id, projectData) => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  },

  deleteProject: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },

  assignMembers: async (id, members) => {
    const { data } = await api.post(`/projects/${id}/members`, { members });
    return data;
  },

  removeMember: async (id, memberId) => {
    const { data } = await api.delete(`/projects/${id}/members/${memberId}`);
    return data;
  },
};

export default projectService;
