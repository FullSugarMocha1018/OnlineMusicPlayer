import api from './api';

export default {
  // 提交维修请求
  async submitRepairOrder(orderData) {
    try {
      const response = await api.post('/api/repair-orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '提交维修请求失败');
    }
  },

  // 获取用户的所有维修工单
  async getRepairOrdersByUser(userId) {
    try {
      const response = await api.get(`/api/repair-orders/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修工单列表失败');
    }
  },

  // 获取维修工单详情
  async getRepairOrderById(orderId) {
    try {
      const response = await api.get(`/api/repair-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取维修工单详情失败');
    }
  },

  // 提交反馈
  async submitFeedback(orderId, feedbackData) {
    try {
      const response = await api.post(`/api/repair-orders/${orderId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '提交反馈失败');
    }
  },

  // 催单
  async remindRepairOrder(orderId) {
    try {
      // 假设催单接口为PUT /api/repair-orders/{orderId}/remind
      const response = await api.put(`/api/repair-orders/${orderId}/remind`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '催单失败');
    }
  }
};