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

  // 用户登录 - JWT认证
  async login(credentials) {
    try {
      // 发送登录请求到API端点
      const response = await api.post('/api/auth/login', credentials);
      const { accessToken, tokenType, userId, username, role } = response.data;
      
      // 存储token到localStorage
      localStorage.setItem('token', accessToken);
      
      // 存储用户信息
      const user = {
        id: userId,
        username: username,
        role: role
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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