import api from './api';

const profileService = {
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/profile', profileData);
    return data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const { data } = await api.post('/profile/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default profileService;
