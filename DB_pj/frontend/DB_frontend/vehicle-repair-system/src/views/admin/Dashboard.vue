<template>
  <div class="admin-dashboard">
    <div class="header">
      <h1>系统概览</h1>
      <p>车辆维修管理系统 - 管理员面板</p>
    </div>
    
    <div class="stats-grid">
      <StatsCard 
        title="用户总数" 
        :value="stats.totalUsers" 
        icon="👥"
        color="#3498db"
        change="+12"
      />
      <StatsCard 
        title="维修人员" 
        :value="stats.totalMechanics" 
        icon="🔧"
        color="#9b59b6"
        change="+5"
      />
      <StatsCard 
        title="车辆总数" 
        :value="stats.totalVehicles" 
        icon="🚗"
        color="#2ecc71"
        change="+23"
      />
      <StatsCard 
        title="维修工单" 
        :value="stats.totalOrders" 
        icon="📋"
        color="#e74c3c"
        change="+42"
      />
    </div>
    
    <div class="charts-container">
      <div class="chart-card">
        <h3>维修费用构成 (本月)</h3>
        <ChartContainer type="doughnut" :data="costDistribution" />
      </div>
      
      <div class="chart-card">
        <h3>工单状态分布</h3>
        <ChartContainer type="pie" :data="orderStatusDistribution" />
      </div>
    </div>
    
    <div class="recent-section">
      <div class="section-header">
        <h2>最近维修工单</h2>
        <router-link to="/admin/repair-orders">查看全部</router-link>
      </div>
      
      <div class="orders-table">
        <table>
          <thead>
            <tr>
              <th>工单号</th>
              <th>车辆</th>
              <th>故障类型</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ order.vehicle.make }} {{ order.vehicle.model }}</td>
              <td>{{ order.faultType }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <router-link :to="`/admin/repair-orders/${order.id}`" class="btn-view">
                  查看
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="recent-section">
      <div class="section-header">
        <h2>系统活动</h2>
      </div>
      <div class="activity-log">
        <div v-for="(activity, index) in activities" :key="index" class="activity-item">
          <div class="activity-icon">📢</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '@/services/adminService';
import StatsCard from '@/components/admin/StatsCard.vue';
import ChartContainer from '@/components/admin/ChartContainer.vue';

export default {
  components: {
    StatsCard,
    ChartContainer
  },
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalMechanics: 0,
        totalVehicles: 0,
        totalOrders: 0
      },
      recentOrders: [],
      activities: [
        {
          title: '新用户注册',
          description: '用户 "张三" 注册了系统账户',
          time: '10分钟前'
        },
        {
          title: '维修工单完成',
          description: '工单 #245 已完成维修，费用 ¥1200.00',
          time: '2小时前'
        },
        {
          title: '系统更新',
          description: '系统已升级至 v1.2.0 版本',
          time: '昨天'
        },
        {
          title: '新维修人员添加',
          description: '李四 被添加为维修人员 (电气技师)',
          time: '2天前'
        }
      ],
      costDistribution: {
        labels: ['工时费', '材料费', '其他费用'],
        datasets: [{
          data: [65, 30, 5],
          backgroundColor: ['#3498db', '#2ecc71', '#f1c40f']
        }]
      },
      orderStatusDistribution: {
        labels: ['已完成', '进行中', '待处理', '已取消'],
        datasets: [{
          data: [45, 20, 25, 10],
          backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c']
        }]
      }
    };
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        // 模拟数据，实际应从API获取
        this.stats = {
          totalUsers: 142,
          totalMechanics: 24,
          totalVehicles: 89,
          totalOrders: 367
        };
        
        // 获取最近的工单
        const orders = await adminService.getAllRepairOrders();
        this.recentOrders = orders.slice(0, 5);
      } catch (error) {
        console.error('加载仪表盘数据失败:', error);
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
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.recent-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

.section-header a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.section-header a:hover {
  text-decoration: underline;
}

.orders-table {
  overflow-x: auto;
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

.btn-view {
  display: inline-block;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
}

.activity-log {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.activity-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: white;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #3498db;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.activity-description {
  color: #7f8c8d;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 13px;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>