<template>
  <div class="repair-order-detail">
    <div class="header">
      <h1>维修工单详情</h1>
      <p>工单号: #{{ repairOrder.id }}</p>
    </div>
    
    <div class="order-container">
      <div class="order-card">
        <div class="order-header">
          <h2>{{ repairOrder.description }}</h2>
          <StatusBadge :status="repairOrder.status" />
        </div>
        
        <div class="order-info">
          <div class="info-row">
            <div class="info-label">故障类型</div>
            <div class="info-value">{{ repairOrder.faultType }}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ formatDateTime(repairOrder.createdAt) }}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">车辆信息</div>
            <div class="info-value">
              {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.licensePlate }})
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">维修人员</div>
            <div class="info-value">
              {{ repairOrder.mechanicName || '尚未分配' }}
              <span v-if="repairOrder.mechanicSpecialty">({{ repairOrder.mechanicSpecialty }})</span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">当前状态</div>
            <div class="info-value">
              <div class="status-timeline">
                <div class="status-item" :class="{active: statusIndex >= 0}">
                  <div class="status-dot"></div>
                  <div class="status-text">已提交</div>
                  <div class="status-time" v-if="repairOrder.createdAt">
                    {{ formatDate(repairOrder.createdAt) }}
                  </div>
                </div>
                
                <div class="status-item" :class="{active: statusIndex >= 1}">
                  <div class="status-dot"></div>
                  <div class="status-text">已接受</div>
                  <div class="status-time" v-if="repairOrder.acceptedAt">
                    {{ formatDate(repairOrder.acceptedAt) }}
                  </div>
                </div>
                
                <div class="status-item" :class="{active: statusIndex >= 2}">
                  <div class="status-dot"></div>
                  <div class="status-text">维修中</div>
                  <div class="status-time" v-if="repairOrder.inProgressAt">
                    {{ formatDate(repairOrder.inProgressAt) }}
                  </div>
                </div>
                
                <div class="status-item" :class="{active: statusIndex >= 3}">
                  <div class="status-dot"></div>
                  <div class="status-text">已完成</div>
                  <div class="status-time" v-if="repairOrder.completedAt">
                    {{ formatDate(repairOrder.completedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section" v-if="repairOrder.progressUpdates && repairOrder.progressUpdates.length > 0">
          <h3>维修进度更新</h3>
          <div class="progress-updates">
            <div v-for="(update, index) in repairOrder.progressUpdates" :key="index" class="update-item">
              <div class="update-header">
                <div class="update-date">{{ formatDateTime(update.timestamp) }}</div>
                <div class="update-author">{{ update.mechanicName }}</div>
              </div>
              <div class="update-content">{{ update.content }}</div>
            </div>
          </div>
        </div>
        
        <div class="section" v-if="repairOrder.materials && repairOrder.materials.length > 0">
          <h3>维修材料清单</h3>
          <div class="materials-list">
            <table>
              <thead>
                <tr>
                  <th>材料名称</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, index) in repairOrder.materials" :key="index">
                  <td>{{ material.materialName }}</td>
                  <td>{{ material.quantity }}</td>
                  <td>¥{{ material.pricePerUnit.toFixed(2) }}</td>
                  <td>¥{{ (material.quantity * material.pricePerUnit).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="materials-total">
              材料总费用: ¥{{ repairOrder.materialsTotal?.toFixed(2) || '0.00' }}
            </div>
          </div>
        </div>
        
        <div class="section" v-if="repairOrder.status === 'Completed'">
          <h3>维修费用明细</h3>
          <div class="cost-summary">
            <div class="cost-item">
              <div class="cost-label">工时费</div>
              <div class="cost-value">¥{{ repairOrder.laborCost?.toFixed(2) || '0.00' }}</div>
            </div>
            <div class="cost-item">
              <div class="cost-label">材料费</div>
              <div class="cost-value">¥{{ repairOrder.materialsTotal?.toFixed(2) || '0.00' }}</div>
            </div>
            <div class="cost-item total">
              <div class="cost-label">总计费用</div>
              <div class="cost-value">¥{{ repairOrder.totalCost?.toFixed(2) || '0.00' }}</div>
            </div>
          </div>
        </div>
        
        <div class="section" v-if="repairOrder.status === 'Completed'">
          <h3>服务反馈</h3>
          <div v-if="repairOrder.feedback">
            <div class="feedback-rating">
              <div class="stars">
                <span v-for="star in 5" :key="star" class="star" 
                      :class="{filled: star <= repairOrder.feedback.rating}">
                  ★
                </span>
              </div>
              <div class="rating-text">{{ repairOrder.feedback.rating }} 星评价</div>
            </div>
            <div class="feedback-comment">
              <p>{{ repairOrder.feedback.comments }}</p>
              <div class="feedback-date">
                提交时间: {{ formatDateTime(repairOrder.feedback.createdAt) }}
              </div>
            </div>
          </div>
          <div v-else class="feedback-form">
            <h4>提交服务评价</h4>
            <div class="rating-input">
              <span v-for="star in 5" :key="star" class="star" 
                    :class="{filled: star <= selectedRating}" 
                    @click="selectedRating = star">
                ★
              </span>
            </div>
            <textarea v-model="feedbackComment" placeholder="请描述您的服务体验..." rows="4"></textarea>
            <button class="btn-submit" @click="submitFeedback">提交评价</button>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button v-if="repairOrder.status !== 'Completed' && repairOrder.status !== 'Canceled'" 
                class="btn-remind" @click="remindRepairOrder">
          <i class="icon">⏱️</i> 催单
        </button>
        <router-link to="/user/repair-orders" class="btn-back">
          <i class="icon">←</i> 返回工单列表
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import repairOrderService from '@/services/repairOrderService';
import vehicleService from '@/services/vehicleService';
import StatusBadge from '@/components/user/StatusBadge.vue';

export default {
  components: {
    StatusBadge
  },
  data() {
    return {
      repairOrder: {},
      vehicle: {},
      selectedRating: 0,
      feedbackComment: '',
      statusIndex: 0
    };
  },
  async created() {
    await this.loadRepairOrder();
    await this.loadVehicle();
    this.calculateStatusIndex();
  },
  methods: {
    async loadRepairOrder() {
      try {
        const orderId = this.$route.params.id;
        this.repairOrder = await repairOrderService.getRepairOrder(orderId);
        
        // 计算材料总费用
        if (this.repairOrder.materials && this.repairOrder.materials.length > 0) {
          this.repairOrder.materialsTotal = this.repairOrder.materials.reduce(
            (sum, material) => sum + (material.quantity * material.pricePerUnit), 0
          );
        }
      } catch (error) {
        console.error('加载维修工单失败:', error);
        alert('加载维修工单失败: ' + error.message);
      }
    },
    
    async loadVehicle() {
      try {
        if (this.repairOrder.vehicleId) {
          this.vehicle = await vehicleService.getVehicle(this.repairOrder.vehicleId);
        }
      } catch (error) {
        console.error('加载车辆信息失败:', error);
      }
    },
    
    calculateStatusIndex() {
      const statusMap = {
        'Pending': 0,
        'Accepted': 1,
        'In Progress': 2,
        'Completed': 3,
        'Canceled': 0
      };
      this.statusIndex = statusMap[this.repairOrder.status] || 0;
    },
    
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    async remindRepairOrder() {
      try {
        await repairOrderService.remindRepairOrder(this.repairOrder.id);
        alert('催单请求已发送，维修人员将尽快处理！');
      } catch (error) {
        console.error('催单失败:', error);
        alert('催单失败: ' + error.message);
      }
    },
    
    async submitFeedback() {
      if (this.selectedRating === 0) {
        alert('请选择评分');
        return;
      }
      
      try {
        const feedbackData = {
          rating: this.selectedRating,
          comments: this.feedbackComment
        };
        
        await repairOrderService.submitFeedback(this.repairOrder.id, feedbackData);
        alert('评价提交成功！');
        this.loadRepairOrder(); // 重新加载工单以显示新提交的评价
      } catch (error) {
        console.error('提交评价失败:', error);
        alert('提交评价失败: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.repair-order-detail {
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

.order-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.order-header h2 {
  margin: 0;
  color: #2c3e50;
}

.info-row {
  display: flex;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  flex: 0 0 120px;
  font-weight: 500;
  color: #7f8c8d;
}

.info-value {
  flex: 1;
  color: #2c3e50;
}

.section {
  margin-top: 35px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.status-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 20px 0;
}

.status-timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  transform: translateY(-50%);
  z-index: 1;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.status-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid white;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.status-item.active .status-dot {
  background: #42b983;
  box-shadow: 0 0 0 4px rgba(66, 185, 131, 0.2);
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.status-item.active .status-text {
  color: #2c3e50;
  font-weight: 600;
}

.status-time {
  font-size: 12px;
  color: #95a5a6;
  text-align: center;
}

.progress-updates {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.update-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.update-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.update-date {
  color: #3498db;
  font-weight: 500;
}

.update-author {
  color: #9b59b6;
  font-weight: 500;
}

.update-content {
  color: #2c3e50;
  line-height: 1.6;
}

.materials-list table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.materials-list th,
.materials-list td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.materials-list th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.materials-total {
  text-align: right;
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.cost-summary {
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-item.total {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 17px;
}

.cost-label {
  color: #2c3e50;
}

.cost-value {
  color: #e74c3c;
  font-weight: 500;
}

.feedback-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stars {
  margin-right: 15px;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: default;
}

.star.filled {
  color: #f1c40f;
}

.rating-text {
  font-weight: 500;
  color: #2c3e50;
}

.feedback-comment {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  line-height: 1.6;
}

.feedback-date {
  text-align: right;
  font-size: 13px;
  color: #95a5a6;
  margin-top: 10px;
}

.feedback-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.rating-input {
  margin-bottom: 15px;
}

.rating-input .star {
  cursor: pointer;
  font-size: 28px;
  margin-right: 5px;
  transition: transform 0.2s;
}

.rating-input .star:hover {
  transform: scale(1.2);
}

textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.btn-submit {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #3aa976;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-remind {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s;
}

.btn-remind:hover {
  transform: translateY(-2px);
}

.btn-back {
  background: #3498db;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .status-timeline {
    flex-wrap: wrap;
  }
  
  .status-item {
    flex: 0 0 50%;
    margin-bottom: 20px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 5px;
  }
  
  .info-label {
    flex: none;
    margin-bottom: 5px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-remind, .btn-back {
    width: 100%;
    justify-content: center;
  }
}
</style>