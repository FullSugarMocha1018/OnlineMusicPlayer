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
          <div class="order-status">
            <span class="status-badge" :class="statusClass">{{ statusText }}</span>
          </div>
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
            <div class="info-label">车主联系方式</div>
            <div class="info-value">{{ user.contactInfo }}</div>
          </div>
        </div>
        
        <div class="section">
          <h3>维修材料清单</h3>
          <div v-if="repairOrder.materials.length > 0" class="materials-list">
            <div class="material-item" v-for="(material, index) in repairOrder.materials" :key="index">
              <div class="material-name">{{ material.materialName }}</div>
              <div class="material-quantity">数量: {{ material.quantity }}</div>
              <div class="material-price">单价: ¥{{ material.pricePerUnit.toFixed(2) }}</div>
              <div class="material-total">小计: ¥{{ (material.quantity * material.pricePerUnit).toFixed(2) }}</div>
            </div>
            <div class="materials-total">
              材料总费用: ¥{{ materialsTotal.toFixed(2) }}
            </div>
          </div>
          <div v-else class="no-materials">
            <p>尚未记录任何维修材料</p>
            <button class="btn-add-material" @click="showMaterialForm = true">
              <i class="icon">+</i> 添加材料
            </button>
          </div>
          
          <div v-if="showMaterialForm" class="material-form">
            <h4>添加维修材料</h4>
            <div class="form-row">
              <div class="form-group">
                <label>材料名称</label>
                <input type="text" v-model="newMaterial.materialName" placeholder="例如: 机油滤清器">
              </div>
              
              <div class="form-group">
                <label>数量</label>
                <input type="number" v-model.number="newMaterial.quantity" min="1" placeholder="数量">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>单价 (¥)</label>
                <input type="number" v-model.number="newMaterial.pricePerUnit" min="0" step="0.01" placeholder="单价">
              </div>
            </div>
            
            <div class="form-actions">
              <button class="btn-save" @click="addMaterial">保存材料</button>
              <button class="btn-cancel" @click="cancelAddMaterial">取消</button>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>维修进度更新</h3>
          <div v-if="repairOrder.progressUpdates.length > 0" class="progress-updates">
            <div v-for="(update, index) in repairOrder.progressUpdates" :key="index" class="update-item">
              <div class="update-header">
                <div class="update-date">{{ formatDateTime(update.timestamp) }}</div>
              </div>
              <div class="update-content">{{ update.content }}</div>
            </div>
          </div>
          <div v-else class="no-updates">
            <p>尚未添加任何进度更新</p>
          </div>
          
          <div class="progress-form">
            <h4>添加进度更新</h4>
            <textarea v-model="newProgress" placeholder="描述当前维修进度..." rows="3"></textarea>
            <button class="btn-add-progress" @click="addProgressUpdate" :disabled="!newProgress">
              添加进度更新
            </button>
          </div>
        </div>
        
        <div class="section">
          <h3>维修费用</h3>
          <div class="cost-summary">
            <div class="cost-item">
              <div class="cost-label">工时费用</div>
              <div class="cost-value">¥{{ laborCost.toFixed(2) }}</div>
            </div>
            <div class="cost-item">
              <div class="cost-label">材料费用</div>
              <div class="cost-value">¥{{ materialsTotal.toFixed(2) }}</div>
            </div>
            <div class="cost-item total">
              <div class="cost-label">总计费用</div>
              <div class="cost-value">¥{{ totalCost.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button v-if="repairOrder.status === 'In Progress'" class="btn-complete" @click="completeOrder">
          <i class="icon">✓</i> 完成维修
        </button>
        <router-link to="/mechanic/repair-orders" class="btn-back">
          <i class="icon">←</i> 返回工单列表
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import mechanicService from '@/services/mechanicService';
import vehicleService from '@/services/vehicleService';
import userService from '@/services/userService';

export default {
  data() {
    return {
      repairOrder: {
        id: null,
        description: '',
        faultType: '',
        status: 'Pending',
        createdAt: '',
        materials: [],
        progressUpdates: []
      },
      vehicle: {},
      user: {},
      newMaterial: {
        materialName: '',
        quantity: 1,
        pricePerUnit: 0
      },
      showMaterialForm: false,
      newProgress: '',
      hourlyRate: 100,
      hoursWorked: 2
    };
  },
  computed: {
    materialsTotal() {
      return this.repairOrder.materials.reduce(
        (sum, material) => sum + (material.quantity * material.pricePerUnit), 0
      );
    },
    laborCost() {
      return this.hoursWorked * this.hourlyRate;
    },
    totalCost() {
      return this.laborCost + this.materialsTotal;
    },
    statusText() {
      const statusMap = {
        'Pending': '待处理',
        'Accepted': '已接受',
        'In Progress': '进行中',
        'Completed': '已完成',
        'Rejected': '已拒绝'
      };
      return statusMap[this.repairOrder.status] || this.repairOrder.status;
    },
    statusClass() {
      return this.repairOrder.status.toLowerCase().replace(' ', '-');
    }
  },
  async created() {
    await this.loadRepairOrder();
    await this.loadVehicle();
    await this.loadUser();
    await this.loadMechanicData();
  },
  methods: {
    async loadRepairOrder() {
      try {
        const orderId = this.$route.params.id;
        this.repairOrder = await mechanicService.getRepairOrder(orderId);
      } catch (error) {
        console.error('加载维修工单失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载维修工单: ' + error.message
        });
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
    
    async loadUser() {
      try {
        if (this.repairOrder.userId) {
          this.user = await userService.getUser(this.repairOrder.userId);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },
    
    async loadMechanicData() {
      try {
        const userId = this.getCurrentUserId();
        const mechanic = await mechanicService.getMechanic(userId);
        this.hourlyRate = mechanic.hourlyRate || 100;
      } catch (error) {
        console.error('加载维修人员信息失败:', error);
      }
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
    
    async addMaterial() {
      if (!this.newMaterial.materialName) {
        this.$notify.warning({
          title: '输入错误',
          message: '请输入材料名称'
        });
        return;
      }
      
      if (this.newMaterial.quantity <= 0) {
        this.$notify.warning({
          title: '输入错误',
          message: '数量必须大于0'
        });
        return;
      }
      
      if (this.newMaterial.pricePerUnit <= 0) {
        this.$notify.warning({
          title: '输入错误',
          message: '单价必须大于0'
        });
        return;
      }
      
      try {
        // 添加材料到本地列表
        this.repairOrder.materials.push({...this.newMaterial});
        
        // 保存到后端
        await mechanicService.recordMaterials(this.repairOrder.id, [this.newMaterial]);
        
        this.$notify.success({
          title: '材料添加成功',
          message: '维修材料已成功记录'
        });
        
        this.cancelAddMaterial();
      } catch (error) {
        console.error('添加材料失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: '添加材料失败: ' + error.message
        });
      }
    },
    
    cancelAddMaterial() {
      this.newMaterial = {
        materialName: '',
        quantity: 1,
        pricePerUnit: 0
      };
      this.showMaterialForm = false;
    },
    
    async addProgressUpdate() {
      if (!this.newProgress.trim()) {
        this.$notify.warning({
          title: '输入错误',
          message: '请输入进度描述'
        });
        return;
      }
      
      try {
        // 添加到本地列表
        const newUpdate = {
          content: this.newProgress,
          timestamp: new Date().toISOString()
        };
        this.repairOrder.progressUpdates.push(newUpdate);
        
        // 保存到后端
        await mechanicService.updateProgress(this.repairOrder.id, this.newProgress);
        
        this.$notify.success({
          title: '进度更新成功',
          message: '维修进度已更新'
        });
        
        this.newProgress = '';
      } catch (error) {
        console.error('更新进度失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: '更新进度失败: ' + error.message
        });
      }
    },
    
    async completeOrder() {
      try {
        // 计算工时费用
        const laborCost = this.hoursWorked * this.hourlyRate;
        
        // 更新工单完成状态
        await mechanicService.completeRepairOrder(this.repairOrder.id);
        
        this.$notify.success({
          title: '工单已完成',
          message: `维修工单 #${this.repairOrder.id} 已完成`
        });
        
        // 返回工单列表
        this.$router.push('/mechanic/repair-orders');
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

.status-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
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
  flex: 0 0 150px;
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

.materials-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.material-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.material-item:last-child {
  border-bottom: none;
}

.material-name {
  flex: 2;
  font-weight: 500;
  color: #2c3e50;
}

.material-quantity, .material-price, .material-total {
  flex: 1;
  text-align: center;
  color: #7f8c8d;
}

.materials-total {
  padding: 15px;
  background: #f8f9fa;
  text-align: right;
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.no-materials {
  padding: 20px;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
}

.btn-add-material {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  margin-top: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.material-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.material-form h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.btn-save {
  background-color: #42b983;
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

.progress-updates {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 20px;
}

.update-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.update-item:last-child {
  border-bottom: none;
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

.update-content {
  color: #2c3e50;
  line-height: 1.6;
}

.no-updates {
  padding: 20px;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #7f8c8d;
}

.progress-form textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.btn-add-progress {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-add-progress:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.cost-summary {
  max-width: 500px;
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

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-complete {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
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
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-complete, .btn-back {
    width: 100%;
    justify-content: center;
  }
}
</style>