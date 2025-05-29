<template>
  <div class="repair-history">
    <div class="header">
      <h1>维修历史记录</h1>
      <p>查看您所有的历史维修工单</p>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>时间范围:</label>
        <select v-model="filterPeriod">
          <option value="all">全部</option>
          <option value="month">最近1个月</option>
          <option value="3months">最近3个月</option>
          <option value="year">最近1年</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>车辆筛选:</label>
        <select v-model="filterVehicle">
          <option value="all">全部车辆</option>
          <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.licensePlate }} ({{ vehicle.make }} {{ vehicle.model }})
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>排序方式:</label>
        <select v-model="sortBy">
          <option value="date_desc">最近优先</option>
          <option value="date_asc">最早优先</option>
          <option value="cost_desc">费用最高优先</option>
          <option value="cost_asc">费用最低优先</option>
        </select>
      </div>
    </div>
    
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-value">{{ completedOrders.length }}</div>
        <div class="stat-label">总维修次数</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">¥{{ totalCost.toFixed(2) }}</div>
        <div class="stat-label">总维修费用</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">{{ averageRating.toFixed(1) }}</div>
        <div class="stat-label">平均评分</div>
      </div>
    </div>
    
    <div v-if="filteredOrders.length === 0" class="no-orders">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无维修记录</h3>
        <p>您尚未完成任何维修工单</p>
        <router-link to="/user/create-order" class="btn-new">提交维修请求</router-link>
      </div>
    </div>
    
    <div v-else class="orders-list">
      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header">
          <div class="order-id">工单 #{{ order.id }}</div>
          <div class="order-date">{{ formatDate(order.completedAt) }}</div>
        </div>
        
        <div class="order-details">
          <div class="detail-item">
            <div class="label">车辆</div>
            <div class="value">{{ getVehicleName(order.vehicleId) }}</div>
          </div>
          
          <div class="detail-item">
            <div class="label">故障类型</div>
            <div class="value">{{ order.faultType }}</div>
          </div>
          
          <div class="detail-item">
            <div class="label">维修人员</div>
            <div class="value">{{ order.mechanicName || '未记录' }}</div>
          </div>
          
          <div class="detail-item">
            <div class="label">维修费用</div>
            <div class="value cost">¥{{ order.totalCost?.toFixed(2) || '0.00' }}</div>
          </div>
          
          <div class="detail-item">
            <div class="label">服务评分</div>
            <div class="value rating">
              <span v-if="order.feedback">
                <span class="stars">
                  <span v-for="star in 5" :key="star" class="star" 
                        :class="{filled: star <= order.feedback.rating}">
                    ★
                  </span>
                </span>
                <span class="rating-text">{{ order.feedback.rating }} 星</span>
              </span>
              <span v-else>未评价</span>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          <router-link :to="`/user/repair-orders/${order.id}`" class="btn-detail">
            查看详情
          </router-link>
        </div>
      </div>
    </div>
    
    <div v-if="filteredOrders.length > 0" class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++" class="page-btn">
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import repairOrderService from '@/services/repairOrderService';
import vehicleService from '@/services/vehicleService';

export default {
  data() {
    return {
      orders: [],
      vehicles: [],
      filterPeriod: 'all',
      filterVehicle: 'all',
      sortBy: 'date_desc',
      currentPage: 1,
      itemsPerPage: 8
    };
  },
  computed: {
    completedOrders() {
      return this.orders.filter(order => order.status === 'Completed');
    },
    
    filteredOrders() {
      let result = [...this.completedOrders];
      
      // 按时间范围筛选
      const now = new Date();
      switch (this.filterPeriod) {
        case 'month':
          result = result.filter(order => 
            new Date(order.completedAt) > new Date(now.setMonth(now.getMonth() - 1)))
          break;
        case '3months':
          result = result.filter(order => 
            new Date(order.completedAt) > new Date(now.setMonth(now.getMonth() - 3)))
          break;
        case 'year':
          result = result.filter(order => 
            new Date(order.completedAt) > new Date(now.setFullYear(now.getFullYear() - 1)))
          break;
      }
      
      // 按车辆筛选
      if (this.filterVehicle !== 'all') {
        result = result.filter(order => order.vehicleId == this.filterVehicle);
      }
      
      // 排序
      switch (this.sortBy) {
        case 'date_desc':
          result.sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt));
          break;
        case 'date_asc':
          result.sort((a, b) => 
            new Date(a.completedAt) - new Date(b.completedAt));
          break;
        case 'cost_desc':
          result.sort((a, b) => 
            (b.totalCost || 0) - (a.totalCost || 0));
          break;
        case 'cost_asc':
          result.sort((a, b) => 
            (a.totalCost || 0) - (b.totalCost || 0));
          break;
      }
      
      return result;
    },
    
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredOrders.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    
    totalCost() {
      return this.completedOrders.reduce((sum, order) => 
        sum + (order.totalCost || 0), 0);
    },
    
    averageRating() {
      const ratedOrders = this.completedOrders.filter(order => 
        order.feedback && order.feedback.rating);
      if (ratedOrders.length === 0) return 0;
      
      const totalRating = ratedOrders.reduce((sum, order) => 
        sum + order.feedback.rating, 0);
      return totalRating / ratedOrders.length;
    }
  },
  async created() {
    await this.loadRepairOrders();
    await this.loadUserVehicles();
  },
  methods: {
    async loadRepairOrders() {
      try {
        const userId = this.getCurrentUserId();
        this.orders = await repairOrderService.getUserRepairOrders(userId);
        
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
        alert('加载维修工单失败: ' + error.message);
      }
    },
    
    async loadUserVehicles() {
      try {
        const userId = this.getCurrentUserId();
        this.vehicles = await vehicleService.getUserVehicles(userId);
      } catch (error) {
        console.error('加载车辆列表失败:', error);
      }
    },
    
    getVehicleName(vehicleId) {
      const vehicle = this.vehicles.find(v => v.id === vehicleId);
      return vehicle 
        ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`
        : '未知车辆';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.repair-history {
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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
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

.filter-group select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #42b983;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  color: #7f8c8d;
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

.btn-new {
  display: inline-block;
  background-color: #42b983;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-new:hover {
  background-color: #3aa976;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.order-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
}

.order-id {
  font-weight: 600;
  font-size: 16px;
}

.order-date {
  font-size: 14px;
  opacity: 0.9;
}

.order-details {
  padding: 20px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  flex: 0 0 80px;
  font-weight: 500;
  color: #7f8c8d;
}

.value {
  flex: 1;
  color: #2c3e50;
}

.value.cost {
  font-weight: 600;
  color: #e74c3c;
}

.value.rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
}

.star {
  color: #ddd;
  font-size: 16px;
  line-height: 1;
}

.star.filled {
  color: #f1c40f;
}

.rating-text {
  font-size: 14px;
}

.order-actions {
  padding: 15px 20px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  text-align: center;
}

.btn-detail {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-detail:hover {
  background-color: #2980b9;
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .orders-list {
    grid-template-columns: 1fr;
  }
}
</style>