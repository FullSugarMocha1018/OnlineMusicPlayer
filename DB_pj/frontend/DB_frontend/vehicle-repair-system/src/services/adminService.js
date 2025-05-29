import api from './api';

export default {
  // 获取所有用户
  async getAllUsers() {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户列表失败');
    }
  },

  // 更新用户信息
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新用户信息失败');
    }
  },

  // 删除用户
  async deleteUser(userId) {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除用户失败');
    }
  },

  // 获取所有维修人员
  async getAllMechanics() {
    try {
      const response = await api.get('/api/admin/mechanics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修人员列表失败');
    }
  },

  // 更新维修人员信息
  async updateMechanic(mechanicId, mechanicData) {
    try {
      const response = await api.put(`/api/admin/mechanics/${mechanicId}`, mechanicData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新维修人员信息失败');
    }
  },

  // 删除维修人员信息
  async deleteMechanic(mechanicId) {
    try {
      await api.delete(`/api/admin/mechanics/${mechanicId}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除维修人员信息失败');
    }
  },

  // 获取所有车辆
  async getAllVehicles() {
    try {
      const response = await api.get('/api/admin/vehicles');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取车辆列表失败');
    }
  },

  // 删除车辆
  async deleteVehicle(vehicleId) {
    try {
      await api.delete(`/api/admin/vehicles/${vehicleId}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除车辆失败');
    }
  },

  // 获取所有维修工单
  async getAllRepairOrders() {
    try {
      const response = await api.get('/api/admin/repair-orders');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修工单列表失败');
    }
  },

  // 删除维修工单
  async deleteRepairOrder(orderId) {
    try {
      await api.delete(`/api/admin/repair-orders/${orderId}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除维修工单失败');
    }
  },

  // 获取统计数据
  async getStatistics(endpoint, params = {}) {
    try {
      const response = await api.get(`/api/admin/stats/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取统计数据失败');
    }
  }
};