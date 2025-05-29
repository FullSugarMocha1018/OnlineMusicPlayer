import api from './api';

export default {
  // 用户注册
  async register(userData) {
    try {
      const response = await api.post('/api/users/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '注册失败');
    }
  },

  // 用户登录
  async login(credentials) {
    try {
      // 创建Basic认证token
      const token = btoa(`${credentials.username}:${credentials.password}`);
      
      // 存储token到localStorage
      localStorage.setItem('token', token);
      
      // 获取用户信息（假设用户ID为1）
      const userResponse = await api.get('/api/users/1');
      const user = userResponse.data;
      
      // 存储用户信息
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      throw new Error(error.response?.data?.message || '登录失败');
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取当前用户
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 检查是否登录
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};