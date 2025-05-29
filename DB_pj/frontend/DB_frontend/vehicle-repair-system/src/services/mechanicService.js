import api from './api';

export default {
  // 获取维修人员详细信息
  async getMechanic(userId) {
    try {
      const response = await api.get(`/api/mechanics/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修人员信息失败');
    }
  },

  // 更新维修人员信息
  async updateMechanic(mechanicId, mechanicData) {
    try {
      const response = await api.put(`/api/mechanics/${mechanicId}`, mechanicData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新维修人员信息失败');
    }
  },

  // 获取分配给维修人员的工单
  async getAssignedRepairOrders(userId) {
    try {
      const response = await api.get(`/api/repair-orders/mechanic/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修工单失败');
    }
  },

  // 更新工单状态
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/api/repair-orders/${orderId}/status?status=${status}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新工单状态失败');
    }
  },

  // 记录维修材料
  async recordMaterials(orderId, materials) {
    try {
      const response = await api.post(`/api/repair-orders/${orderId}/materials`, materials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '记录材料失败');
    }
  },

  // 更新维修进度
  async updateProgress(orderId, progressUpdate) {
    try {
      const response = await api.put(`/api/repair-orders/${orderId}/progress?progressUpdate=${encodeURIComponent(progressUpdate)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新进度失败');
    }
  },

  // 完成维修工单
  async completeRepairOrder(orderId) {
    try {
      const response = await api.put(`/api/repair-orders/${orderId}/complete`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '完成工单失败');
    }
  },

  // 获取维修历史记录
  async getRepairHistory(userId) {
    try {
      const response = await api.get(`/api/repair-orders/history/mechanic/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修历史失败');
    }
  }
};