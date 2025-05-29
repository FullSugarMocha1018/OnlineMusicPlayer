import api from './api';

export default {
  // 添加车辆
  async addVehicle(vehicleData) {
    try {
      const response = await api.post('/api/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '添加车辆失败');
    }
  },

  // 获取用户的所有车辆
  async getVehiclesByUser(userId) {
    try {
      const response = await api.get(`/api/vehicles/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取车辆列表失败');
    }
  },

  // 获取车辆详情
  async getVehicleById(vehicleId) {
    try {
      const response = await api.get(`/api/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取车辆信息失败');
    }
  },

  // 更新车辆信息
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await api.put(`/api/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新车辆信息失败');
    }
  },

  // 删除车辆
  async deleteVehicle(vehicleId) {
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除车辆信息失败');
    }
  }
};