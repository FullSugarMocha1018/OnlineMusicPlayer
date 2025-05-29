import api from './api';

export default {
  // 获取用户信息
  async getUser(userId) {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户信息失败');
    }
  },

  // 更新用户信息
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新用户信息失败');
    }
  }
};