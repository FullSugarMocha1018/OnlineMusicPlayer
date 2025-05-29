<template>
  <div class="repair-orders">
    <div class="header">
      <h1>维修工单管理</h1>
      <p>处理分配给您的维修任务</p>
    </div>
    
    <div class="tabs">
      <button 
        :class="{active: activeTab === 'pending'}" 
        @click="activeTab = 'pending'"
      >
        待处理工单 <span class="badge">{{ pendingOrders.length }}</span>
      </button>
      <button 
        :class="{active: activeTab === 'inProgress'}" 
        @click="activeTab = 'inProgress'"
      >
        进行中工单 <span class="badge">{{ inProgressOrders.length }}</span>
      </button>
    </div>
    
    <div v-if="activeTab === 'pending'">
      <div v-if="pendingOrders.length === 0" class="no-orders">
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>暂无待处理工单</h3>
          <p>系统尚未为您分配新的维修任务</p>
        </div>
      </div>
      
      <div v-else class="orders-list">
        <div class="order-card" v-for="order in pendingOrders" :key="order.id">
          <div class="order-header">
            <div class="order-id">工单 #{{ order.id }}</div>
            <div class="order-date">提交时间: {{ formatDate(order.createdAt) }}</div>
          </div>
          
          <div class="order-content">
            <div class="order-description">
              <h3>{{ order.description }}</h3>
              <p><strong>故障类型:</strong> {{ order.faultType }}</p>
            </div>
            
            <div class="vehicle-info">
              <div class="vehicle-make">{{ order.vehicle.make }} {{ order.vehicle.model }}</div>
              <div class="vehicle-plate">{{ order.vehicle.licensePlate }}</div>
            </div>
          </div>
          
          <div class="order-actions">
            <button class="btn-accept" @click="acceptOrder(order.id)">
              <i class="icon">✓</i> 接受工单
            </button>
            <button class="btn-reject" @click="rejectOrder(order.id)">
              <i class="icon">✕</i> 拒绝工单
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'inProgress'">
      <div v-if="inProgressOrders.length === 0" class="no-orders">
        <div class="empty-state">
          <div class="empty-icon">🔧</div>
          <h3>暂无进行中工单</h3>
          <p>请先接受待处理工单开始维修</p>
          <button class="btn-switch" @click="activeTab = 'pending'">查看待处理工单</button>
        </div>
      </div>
      
      <div v-else class="orders-list">
        <div class="order-card" v-for="order in inProgressOrders" :key="order.id">
          <div class="order-header">
            <div class="order-id">工单 #{{ order.id }}</div>
            <div class="order-status">状态: {{ getStatusText(order.status) }}</div>
          </div>
          
          <div class="order-content">
            <div class="order-description">
              <h3>{{ order.description }}</h3>
              <p><strong>故障类型:</strong> {{ order.faultType }}</p>
            </div>
            
            <div class="vehicle-info">
              <div class="vehicle-make">{{ order.vehicle.make }} {{ order.vehicle.model }}</div>
              <div class="vehicle-plate">{{ order.vehicle.licensePlate }}</div>
            </div>
            
            <div class="progress-section">
              <label>当前进度:</label>
              <div class="progress-update">{{ order.latestProgress || '暂无进度更新' }}</div>
            </div>
          </div>
          
          <div class="order-actions">
            <button class="btn-update" @click="viewOrder(order.id)">
              <i class="icon">✏️</i> 更新进度
            </button>
            <button v-if="order.materials.length === 0" class="btn-material" @click="viewOrder(order.id)">
              <i class="icon">📋</i> 记录材料
            </button>
            <button class="btn-complete" @click="completeOrder(order.id)">
              <i class="icon">✓</i> 完成工单
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mechanicService from '@/services/mechanicService';

export default {
  data() {
    return {
      orders: [],
      activeTab: 'pending'
    };
  },
  computed: {
    pendingOrders() {
      return this.orders.filter(order => order.status === 'Pending');
    },
    inProgressOrders() {
      return this.orders.filter(order => order.status === 'In Progress');
    }
  },
  async created() {
    await this.loadRepairOrders();
  },
  methods: {
    async loadRepairOrders() {
      try {
        const userId = this.getCurrentUserId();
        this.orders = await mechanicService.getAssignedRepairOrders(userId);
      } catch (error) {
        console.error('加载维修工单失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载维修工单: ' + error.message
        });
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    getStatusText(status) {
      const statusMap = {
        'Pending': '待处理',
        'Accepted': '已接受',
        'In Progress': '进行中',
        'Completed': '已完成',
        'Rejected': '已拒绝'
      };
      return statusMap[status] || status;
    },
    
    async acceptOrder(orderId) {
      try {
        await mechanicService.updateOrderStatus(orderId, 'Accepted');
        this.$notify({
          title: '工单已接受',
          message: '您已成功接受该维修工单',
          type: 'success'
        });
        await this.loadRepairOrders();
      } catch (error) {
        console.error('接受工单失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: '接受工单失败: ' + error.message
        });
      }
    },
    
    async rejectOrder(orderId) {
      try {
        await mechanicService.updateOrderStatus(orderId, 'Rejected');
        this.$notify({
          title: '工单已拒绝',
          message: '您已拒绝该维修工单，系统将重新分配',
          type: 'warning'
        });
        await this.loadRepairOrders();
      } catch (error) {
        console.error('拒绝工单失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: '拒绝工单失败: ' + error.message
        });
      }
    },
    
    viewOrder(orderId) {
      this.$router.push(`/mechanic/repair-orders/${orderId}`);
    },
    
    async completeOrder(orderId) {
      try {
        await mechanicService.completeRepairOrder(orderId);
        this.$notify({
          title: '工单已完成',
          message: '您已成功完成该维修工单',
          type: 'success'
        });
        await this.loadRepairOrders();
      } catch (error) {
        console.error('完成工单失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: '完成工单失败: ' + error.message
        });
      }
    },
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.repair-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
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

.tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  padding: 12px 25px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  cursor: pointer;
  position: relative;
  margin-right: 5px;
}

.tabs button.active {
  color: #3498db;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #3498db;
}

.badge {
  display: inline-block;
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 5px;
}

.no-orders {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 50px 20px;
  text-align: center;
}

.empty-state {
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #bdc3c7;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 25px;
}

.btn-switch {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-switch:hover {
  background-color: #2980b9;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 25px;
}

.order-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: 600;
  color: #2c3e50;
}

.order-date, .order-status {
  font-size: 14px;
  color: #7f8c8d;
}

.order-content {
  padding: 20px;
}

.order-description h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.order-description p {
  margin: 0 0 15px 0;
  color: #7f8c8d;
}

.vehicle-info {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 20px;
}

.vehicle-make {
  font-weight: 500;
  color: #2c3e50;
}

.vehicle-plate {
  background: #eaf2f8;
  color: #3498db;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
}

.progress-section {
  margin-top: 20px;
}

.progress-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.progress-update {
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px;
  min-height: 60px;
  color: #7f8c8d;
}

.order-actions {
  display: flex;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  gap: 10px;
}

.order-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-accept {
  background: #eafaf1;
  color: #27ae60;
}

.btn-accept:hover {
  background: #d5f5e3;
}

.btn-reject {
  background: #fdedec;
  color: #e74c3c;
}

.btn-reject:hover {
  background: #fadbd8;
}

.btn-update {
  background: #ebf5fb;
  color: #3498db;
}

.btn-update:hover {
  background: #d6eaf8;
}

.btn-material {
  background: #fef9e7;
  color: #f39c12;
}

.btn-material:hover {
  background: #fcf3cf;
}

.btn-complete {
  background: #e8f8f5;
  color: #1d8348;
}

.btn-complete:hover {
  background: #d1f2eb;
}

@media (max-width: 768px) {
  .orders-list {
    grid-template-columns: 1fr;
  }
  
  .order-actions {
    flex-direction: column;
  }
}
</style>