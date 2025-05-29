<template>
  <div class="user-vehicles">
    <div class="header">
      <h1>我的车辆</h1>
      <p>管理您的车辆信息</p>
    </div>
    
    <div class="actions">
      <button @click="showAddForm = true" class="btn-add">
        <span>+</span> 添加新车辆
      </button>
    </div>
    
    <div v-if="showAddForm" class="add-vehicle-form">
      <h2>添加新车辆</h2>
      <form @submit.prevent="addVehicle">
        <div class="form-row">
          <div class="form-group">
            <label>车牌号</label>
            <input type="text" v-model="newVehicle.licensePlate" required>
          </div>
          
          <div class="form-group">
            <label>品牌</label>
            <input type="text" v-model="newVehicle.make" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>型号</label>
            <input type="text" v-model="newVehicle.model" required>
          </div>
          
          <div class="form-group">
            <label>年份</label>
            <input type="text" v-model="newVehicle.year" required>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-save">保存车辆</button>
          <button type="button" class="btn-cancel" @click="cancelAdd">取消</button>
        </div>
      </form>
    </div>
    
    <div v-if="vehicles.length === 0" class="no-vehicles">
      <div class="empty-state">
        <div class="empty-icon">🚗</div>
        <h3>您还没有添加任何车辆</h3>
        <p>请点击上方按钮添加您的第一辆车</p>
      </div>
    </div>
    
    <div v-else class="vehicles-grid">
      <VehicleCard 
        v-for="vehicle in vehicles" 
        :key="vehicle.id" 
        :vehicle="vehicle" 
        @edit="editVehicle(vehicle)"
        @delete="confirmDelete(vehicle)"
      />
    </div>
    
    <div v-if="editingVehicle" class="edit-modal">
      <div class="modal-content">
        <h2>编辑车辆信息</h2>
        <form @submit.prevent="updateVehicle">
          <div class="form-row">
            <div class="form-group">
              <label>车牌号</label>
              <input type="text" v-model="editingVehicle.licensePlate" required>
            </div>
            
            <div class="form-group">
              <label>品牌</label>
              <input type="text" v-model="editingVehicle.make" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>型号</label>
              <input type="text" v-model="editingVehicle.model" required>
            </div>
            
            <div class="form-group">
              <label>年份</label>
              <input type="text" v-model="editingVehicle.year" required>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">保存更改</button>
            <button type="button" class="btn-cancel" @click="cancelEdit">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="deletingVehicle" class="delete-modal">
      <div class="modal-content">
        <h2>确认删除</h2>
        <p>确定要删除车辆 <strong>{{ deletingVehicle.licensePlate }}</strong> 吗？此操作不可逆。</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="deleteVehicle">确认删除</button>
          <button class="btn-cancel" @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vehicleService from '@/services/vehicleService';
import VehicleCard from '@/components/user/VehicleCard.vue';

export default {
  components: {
    VehicleCard
  },
  data() {
    return {
      vehicles: [],
      showAddForm: false,
      newVehicle: {
        licensePlate: '',
        make: '',
        model: '',
        year: '',
        ownerId: null
      },
      editingVehicle: null,
      deletingVehicle: null
    };
  },
  async created() {
    await this.loadUserVehicles();
  },
  methods: {
    async loadUserVehicles() {
      try {
        const userId = this.getCurrentUserId();
        this.vehicles = await vehicleService.getUserVehicles(userId);
      } catch (error) {
        console.error('加载车辆列表失败:', error);
      }
    },
    
    async addVehicle() {
      try {
        const userId = this.getCurrentUserId();
        this.newVehicle.ownerId = userId;
        const newVehicle = await vehicleService.addVehicle(this.newVehicle);
        this.vehicles.push(newVehicle);
        this.resetNewVehicle();
        this.showAddForm = false;
      } catch (error) {
        console.error('添加车辆失败:', error);
        alert('添加车辆失败: ' + error.message);
      }
    },
    
    editVehicle(vehicle) {
      this.editingVehicle = { ...vehicle };
    },
    
    async updateVehicle() {
      try {
        const updatedVehicle = await vehicleService.updateVehicle(
          this.editingVehicle.id, 
          this.editingVehicle
        );
        
        // 更新本地车辆列表
        const index = this.vehicles.findIndex(v => v.id === updatedVehicle.id);
        if (index !== -1) {
          this.vehicles.splice(index, 1, updatedVehicle);
        }
        
        this.editingVehicle = null;
      } catch (error) {
        console.error('更新车辆失败:', error);
        alert('更新车辆失败: ' + error.message);
      }
    },
    
    confirmDelete(vehicle) {
      this.deletingVehicle = vehicle;
    },
    
    async deleteVehicle() {
      try {
        await vehicleService.deleteVehicle(this.deletingVehicle.id);
        
        // 从本地车辆列表中移除
        const index = this.vehicles.findIndex(v => v.id === this.deletingVehicle.id);
        if (index !== -1) {
          this.vehicles.splice(index, 1);
        }
        
        this.deletingVehicle = null;
      } catch (error) {
        console.error('删除车辆失败:', error);
        alert('删除车辆失败: ' + error.message);
      }
    },
    
    cancelAdd() {
      this.resetNewVehicle();
      this.showAddForm = false;
    },
    
    cancelEdit() {
      this.editingVehicle = null;
    },
    
    cancelDelete() {
      this.deletingVehicle = null;
    },
    
    resetNewVehicle() {
      this.newVehicle = {
        licensePlate: '',
        make: '',
        model: '',
        year: '',
        ownerId: null
      };
    },
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.user-vehicles {
  max-width: 1200px;
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

.actions {
  margin-bottom: 30px;
}

.btn-add {
  background: linear-gradient(135deg, #42b983, #3498db);
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
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.3);
}

.btn-add span {
  font-size: 20px;
}

.add-vehicle-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.add-vehicle-form h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
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
  margin-top: 20px;
}

.btn-save {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.no-vehicles {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  text-align: center;
}

.empty-state {
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.empty-state p {
  color: #7f8c8d;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.edit-modal,
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
  max-width: 600px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.btn-confirm {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>