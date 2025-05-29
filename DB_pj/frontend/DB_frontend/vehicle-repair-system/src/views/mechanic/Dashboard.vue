<template>
  <div class="mechanic-dashboard">
    <div class="header">
      <h1>欢迎, {{ mechanic.name || mechanic.username }}</h1>
      <p>车辆维修管理系统 - 维修人员面板</p>
    </div>
    
    <div class="summary-cards">
      <div class="card">
        <div class="card-icon order-icon">🔧</div>
        <div class="card-content">
          <h3>待处理工单</h3>
          <p>{{ pendingOrders.length }} 个</p>
          <router-link to="/mechanic/repair-orders">处理工单</router-link>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon progress-icon">⏱️</div>
        <div class="card-content">
          <h3>进行中工单</h3>
          <p>{{ inProgressOrders.length }} 个</p>
          <router-link to="/mechanic/repair-orders">继续维修</router-link>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon income-icon">💰</div>
        <div class="card-content">
          <h3>本月收入</h3>
          <p>¥{{ monthlyIncome.toFixed(2) }}</p>
          <router-link to="/mechanic/history">查看详情</router-link>
        </div>
      </div>
    </div>
    
    <div class="recent-section">
      <div class="section-header">
        <h2>待处理工单</h2>
        <div v-if="pendingOrders.length === 0" class="no-orders">
          <p>暂无待处理工单</p>
        </div>
      </div>
      
      <div class="orders-grid">
        <OrderCard 
          v-for="order in pendingOrders" 
          :key="order.id" 
          :order="order"
          @accept="acceptOrder(order.id)"
          @reject="rejectOrder(order.id)"
        />
      </div>
    </div>
    
    <div class="recent-section">
      <div class="section-header">
        <h2>进行中工单</h2>
        <div v-if="inProgressOrders.length === 0" class="no-orders">
          <p>暂无进行中工单</p>
        </div>
      </div>
      
      <div class="orders-grid">
        <OrderCard 
          v-for="order in inProgressOrders" 
          :key="order.id" 
          :order="order"
          @view="viewOrder(order.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import mechanicService from '@/services/mechanicService';
import OrderCard from '@/components/mechanic/OrderCard.vue';

export default {
  components: {
    OrderCard
  },
  data() {
    return {
      mechanic: {
        id: null,
        username: '',
        name: '',
        specialty: '',
        hourlyRate: 0
      },
      orders: [],
      monthlyIncome: 0
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
    await this.loadMechanicData();
    await this.loadRepairOrders();
    this.calculateMonthlyIncome();
  },
  methods: {
    async loadMechanicData() {
      try {
        const userId = this.getCurrentUserId();
        this.mechanic = await mechanicService.getMechanic(userId);
      } catch (error) {
        console.error('加载维修人员信息失败:', error);
      }
    },
    
    async loadRepairOrders() {
      try {
        const userId = this.getCurrentUserId();
        this.orders = await mechanicService.getAssignedRepairOrders(userId);
      } catch (error) {
        console.error('加载维修工单失败:', error);
      }
    },
    
    calculateMonthlyIncome() {
      // 简化计算，实际应根据历史记录中的工时计算
      const hoursWorked = this.inProgressOrders.length * 3; // 假设每个工单3小时
      this.monthlyIncome = hoursWorked * (this.mechanic.hourlyRate || 100);
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
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.mechanic-dashboard {
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

.order-icon {
  background: linear-gradient(135deg, #9b59b6, #e74c3c);
  color: white;
}

.progress-icon {
  background: linear-gradient(135deg, #3498db, #1abc9c);
  color: white;
}

.income-icon {
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
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.no-orders {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
}
</style>