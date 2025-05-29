<template>
  <div class="admin-statistics">
    <div class="header">
      <h1>数据统计</h1>
      <p>分析系统运行状况和业务数据</p>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>时间范围:</label>
        <select v-model="timeRange">
          <option value="month">本月</option>
          <option value="quarter">本季度</option>
          <option value="year">本年</option>
          <option value="all">全部</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>开始日期:</label>
        <input type="date" v-model="startDate">
      </div>
      
      <div class="filter-group">
        <label>结束日期:</label>
        <input type="date" v-model="endDate">
      </div>
      
      <button class="btn-apply" @click="loadStatistics">应用筛选</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card large">
        <h3>维修费用构成</h3>
        <ChartContainer type="bar" :data="costStructureData" />
      </div>
      
      <div class="stat-card">
        <h3>各车型维修次数</h3>
        <ChartContainer type="horizontalBar" :data="repairsByModelData" />
      </div>
      
      <div class="stat-card">
        <h3>工单状态分布</h3>
        <ChartContainer type="doughnut" :data="orderStatusData" />
      </div>
      
      <div class="stat-card large">
        <h3>月度维修费用趋势</h3>
        <ChartContainer type="line" :data="monthlyCostTrend" />
      </div>
      
      <div class="stat-card">
        <h3>故障类型分布</h3>
        <ChartContainer type="pie" :data="faultTypeDistribution" />
      </div>
      
      <div class="stat-card">
        <h3>维修人员工作量</h3>
        <ChartContainer type="radar" :data="mechanicWorkload" />
      </div>
    </div>
    
    <div class="data-table">
      <h3>负面反馈工单 (评分 &lt; 3)</h3>
      <table>
        <thead>
          <tr>
            <th>工单号</th>
            <th>车辆</th>
            <th>维修人员</th>
            <th>评分</th>
            <th>评论</th>
            <th>提交时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in negativeFeedbackOrders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>{{ order.vehicle.make }} {{ order.vehicle.model }}</td>
            <td>{{ order.mechanic.name }}</td>
            <td>
              <div class="rating">
                <span v-for="star in 5" :key="star" class="star" 
                      :class="{filled: star <= order.feedback.rating}">
                  ★
                </span>
              </div>
            </td>
            <td>{{ order.feedback.comments }}</td>
            <td>{{ formatDate(order.feedback.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import adminService from '@/services/adminService';
import ChartContainer from '@/components/admin/ChartContainer.vue';

export default {
  components: {
    ChartContainer
  },
  data() {
    return {
      timeRange: 'month',
      startDate: '',
      endDate: '',
      costStructureData: {
        labels: ['工时费', '材料费', '其他'],
        datasets: [{
          label: '费用 (¥)',
          data: [12500, 8400, 2100],
          backgroundColor: '#3498db'
        }]
      },
      repairsByModelData: {
        labels: ['Toyota Camry', 'Honda Accord', 'Ford Focus', 'BMW 3 Series', 'Audi A4'],
        datasets: [{
          label: '维修次数',
          data: [42, 38, 28, 22, 18],
          backgroundColor: '#9b59b6'
        }]
      },
      orderStatusData: {
        labels: ['已完成', '进行中', '待处理', '已取消'],
        datasets: [{
          data: [120, 45, 30, 15],
          backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c']
        }]
      },
      monthlyCostTrend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        datasets: [{
          label: '总费用 (¥)',
          data: [18500, 19200, 21000, 20500, 23000, 24500, 26000],
          borderColor: '#e74c3c',
          fill: false
        }]
      },
      faultTypeDistribution: {
        labels: ['发动机故障', '电气系统', '刹车系统', '悬挂系统', '空调系统'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e74c3c']
        }]
      },
      mechanicWorkload: {
        labels: ['张三', '李四', '王五', '赵六', '钱七'],
        datasets: [{
          label: '完成工单数',
          data: [42, 38, 35, 28, 25],
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: '#3498db'
        }]
      },
      negativeFeedbackOrders: [
        {
          id: 245,
          vehicle: { make: 'Toyota', model: 'Camry' },
          mechanic: { name: '张三' },
          feedback: {
            rating: 2,
            comments: '维修时间过长，服务态度一般',
            createdAt: '2023-05-15T08:30:00Z'
          }
        },
        {
          id: 312,
          vehicle: { make: 'Honda', model: 'Accord' },
          mechanic: { name: '李四' },
          feedback: {
            rating: 1,
            comments: '维修后问题依然存在，需要返修',
            createdAt: '2023-06-02T14:20:00Z'
          }
        }
      ]
    };
  },
  methods: {
    async loadStatistics() {
      try {
        // 这里应该调用API获取数据
        // 模拟数据更新
        this.$notify.success({
          title: '数据已更新',
          message: '统计数据已根据筛选条件刷新'
        });
      } catch (error) {
        console.error('加载统计数据失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载统计数据: ' + error.message
        });
      }
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
.admin-statistics {
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
  margin-bottom: 30px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.stat-card.large {
  grid-column: span 2;
}

.stat-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.data-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-top: 30px;
  overflow-x: auto;
}

.data-table h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
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

.rating {
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

@media (max-width: 1200px) {
  .stat-card.large {
    grid-column: span 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>