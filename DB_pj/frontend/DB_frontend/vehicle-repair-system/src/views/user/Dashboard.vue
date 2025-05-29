<template>
  <div class="user-dashboard">
    <div class="header">
      <h1>欢迎, {{ user.username }}</h1>
      <p>车辆维修管理系统 - 用户面板</p>
    </div>
    
    <div class="summary-cards">
      <div class="card">
        <div class="card-icon vehicle-icon">🚗</div>
        <div class="card-content">
          <h3>我的车辆</h3>
          <p>{{ vehicleCount }} 辆</p>
          <router-link to="/user/vehicles">管理车辆</router-link>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon order-icon">🔧</div>
        <div class="card-content">
          <h3>维修工单</h3>
          <p>{{ repairOrderCount }} 个</p>
          <router-link to="/user/repair-orders">查看工单</router-link>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon pending-icon">⏱️</div>
        <div class="card-content">
          <h3>待处理</h3>
          <p>{{ pendingRepairCount }} 个</p>
          <router-link to="/user/repair-orders">查看详情</router-link>
        </div>
      </div>
    </div>
    
    <div class="recent-section">
      <h2>最近的维修工单</h2>
      <div class="recent-orders">
        <div v-if="recentOrders.length === 0" class="no-orders">
          <p>暂无最近的维修工单</p>
          <router-link to="/user/create-order" class="btn-new">提交新维修请求</router-link>
        </div>
        
        <div v-else>
          <div v-for="order in recentOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <h3>{{ order.description }}</h3>
              <StatusBadge :status="order.status" />
            </div>
            <div class="order-details">
              <p><strong>故障类型:</strong> {{ order.faultType }}</p>
              <p><strong>提交时间:</strong> {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-actions">
              <router-link :to="`/user/repair-orders/${order.id}`" class="btn-detail">查看详情</router-link>
              <button v-if="order.status === 'Pending'" @click="remindOrder(order.id)" class="btn-remind">催单</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userService from '@/services/userService';
import repairOrderService from '@/services/repairOrderService';
import StatusBadge from '@/components/user/StatusBadge.vue';

export default {
  components: {
    StatusBadge
  },
  data() {
    return {
      user: {
        id: null,
        username: '',
        contactInfo: ''
      },
      vehicleCount: 0,
      repairOrderCount: 0,
      pendingRepairCount: 0,
      recentOrders: []
    };
  },
  async created() {
    await this.loadUserData();
    await this.loadRepairOrders();
  },
  methods: {
    async loadUserData() {
      try {
        const userId = this.getCurrentUserId();
        this.user = await userService.getUser(userId);
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },
    
    async loadRepairOrders() {
      try {
        const userId = this.getCurrentUserId();
        const orders = await repairOrderService.getUserRepairOrders(userId);
        this.repairOrderCount = orders.length;
        this.pendingRepairCount = orders.filter(order => order.status !== 'Completed').length;
        this.recentOrders = orders.slice(0, 3);
      } catch (error) {
        console.error('加载维修工单失败:', error);
      }
    },
    
    async remindOrder(orderId) {
      try {
        await repairOrderService.remindRepairOrder(orderId);
        alert('催单请求已发送！');
      } catch (error) {
        console.error('催单失败:', error);
        alert('催单失败: ' + error.message);
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.user-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 18px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.vehicle-icon {
  background: linear-gradient(135deg, #3498db, #1abc9c);
  color: white;
}

.order-icon {
  background: linear-gradient(135deg, #9b59b6, #e74c3c);
  color: white;
}

.pending-icon {
  background: linear-gradient(135deg, #f39c12, #d35400);
  color: white;
}

.card-content {
  flex: 1;
  padding: 20px;
}

.card-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.card-content p {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-content a {
  display: inline-block;
  margin-top: 10px;
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.card-content a:hover {
  text-decoration: underline;
}

.recent-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.recent-section h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.no-orders {
  text-align: center;
  padding: 40px 0;
}

.btn-new {
  display: inline-block;
  background-color: #42b983;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 15px;
  transition: background-color 0.3s;
}

.btn-new:hover {
  background-color: #3aa976;
}

.order-card {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.order-details p {
  margin: 5px 0;
  color: #7f8c8d;
}

.order-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn-detail {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
}

.btn-remind {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
</style>