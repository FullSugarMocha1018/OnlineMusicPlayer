<template>
  <div class="repair-order-management">
    <div class="header">
      <h1>维修工单管理</h1>
      <p>管理系统所有维修工单</p>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>状态:</label>
        <select v-model="filterStatus">
          <option value="all">全部状态</option>
          <option value="Pending">待处理</option>
          <option value="Accepted">已接受</option>
          <option value="In Progress">进行中</option>
          <option value="Completed">已完成</option>
          <option value="Canceled">已取消</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>时间范围:</label>
        <input type="date" v-model="startDate">
      </div>
      
      <div class="filter-group">
        <label>至</label>
        <input type="date" v-model="endDate">
      </div>
      
      <button class="btn-apply" @click="loadOrders">应用筛选</button>
    </div>
    
    <div class="orders-table">
      <table>
        <thead>
          <tr>
            <th>工单号</th>
            <th>车辆</th>
            <th>车主</th>
            <th>故障类型</th>
            <th>维修人员</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>总费用 (¥)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>{{ order.vehicle.make }} {{ order.vehicle.model }}</td>
            <td>{{ order.user.username }}</td>
            <td>{{ order.faultType }}</td>
            <td>{{ order.mechanic ? order.mechanic.name : '-' }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.totalCost?.toFixed(2) || '0.00' }}</td>
            <td class="actions">
              <router-link :to="`/admin/repair-orders/${order.id}`" class="btn-view">
                查看
              </router-link>
              <button class="btn-delete" @click="confirmDeleteOrder(order)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++" class="page-btn">
        下一页
      </button>
    </div>
    
    <div v-if="deletingOrder" class="delete-modal">
      <div class="modal-content">
        <h2>确认删除工单</h2>
        <p>确定要删除工单 <strong>#{{ deletingOrder.id }}</strong> 吗？此操作不可逆。</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="deleteOrder">确认删除</button>
          <button class="btn-cancel" @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '@/services/adminService';

export default {
  data() {
    return {
      orders: [],
      filterStatus: 'all',
      startDate: '',
      endDate: '',
      deletingOrder: null,
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    filteredOrders() {
      let result = [...this.orders];
      
      // 按状态筛选
      if (this.filterStatus !== 'all') {
        result = result.filter(order => order.status === this.filterStatus);
      }
      
      // 按时间范围筛选
      if (this.startDate) {
        const start = new Date(this.startDate);
        result = result.filter(order => new Date(order.createdAt) >= start);
      }
      
      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999); // 设置为当天的最后一刻
        result = result.filter(order => new Date(order.createdAt) <= end);
      }
      
      // 分页
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return result.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.orders.length / this.itemsPerPage);
    }
  },
  async created() {
    await this.loadOrders();
  },
  methods: {
    async loadOrders() {
      try {
        this.orders = await adminService.getAllRepairOrders();
        
        // 计算每个订单的总费用
        this.orders.forEach(order => {
          if (order.materials && order.materials.length > 0) {
            order.materialsTotal = order.materials.reduce(
              (sum, material) => sum + (material.quantity * material.pricePerUnit), 0
            );
            order.totalCost = (order.laborCost || 0) + order.materialsTotal;
          } else {
            order.totalCost = order.laborCost || 0;
          }
        });
      } catch (error) {
        console.error('加载维修工单失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载维修工单: ' + error.message
        });
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        'Pending': '待处理',
        'Accepted': '已接受',
        'In Progress': '进行中',
        'Completed': '已完成',
        'Canceled': '已取消'
      };
      return statusMap[status] || status;
    },
    
    getStatusClass(status) {
      return status.toLowerCase().replace(' ', '-');
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    confirmDeleteOrder(order) {
      this.deletingOrder = order;
    },
    
    async deleteOrder() {
      try {
        await adminService.deleteRepairOrder(this.deletingOrder.id);
        
        // 从本地列表中移除
        const index = this.orders.findIndex(o => o.id === this.deletingOrder.id);
        if (index !== -1) {
          this.orders.splice(index, 1);
        }
        
        this.$notify.success({
          title: '删除成功',
          message: `工单 #${this.deletingOrder.id} 已删除`
        });
        
        this.deletingOrder = null;
      } catch (error) {
        console.error('删除工单失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: '无法删除工单: ' + error.message
        });
      }
    },
    
    cancelDelete() {
      this.deletingOrder = null;
    }
  }
};
</script>

<style scoped>
.repair-order-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 18px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filter-group select,
.filter-group input {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.btn-apply {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.orders-table {
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef9e7;
  color: #b7950b;
  border: 1px solid #f4d03f;
}

.status-badge.accepted {
  background-color: #eafaf1;
  color: #27ae60;
  border: 1px solid #2ecc71;
}

.status-badge.in-progress {
  background-color: #ebf5fb;
  color: #2874a6;
  border: 1px solid #3498db;
}

.status-badge.completed {
  background-color: #e8f8f5;
  color: #1d8348;
  border: 1px solid #2ecc71;
}

.status-badge.canceled {
  background-color: #fdedec;
  color: #c0392b;
  border: 1px solid #e74c3c;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  display: inline-block;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.page-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #2980b9;
}

.page-info {
  color: #7f8c8d;
  font-size: 14px;
}

.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.modal-content p {
  margin-bottom: 25px;
  color: #7f8c8d;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.btn-confirm {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
}
</style>