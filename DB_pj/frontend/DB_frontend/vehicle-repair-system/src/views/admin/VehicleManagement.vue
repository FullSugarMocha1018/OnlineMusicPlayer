<template>
  <div class="vehicle-management">
    <div class="header">
      <h1>车辆管理</h1>
      <p>管理系统所有车辆信息</p>
    </div>
    
    <div class="actions">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索车辆...">
        <button class="btn-search">🔍</button>
      </div>
      <button class="btn-add" @click="showAddForm = true">
        <i class="icon">+</i> 添加车辆
      </button>
    </div>
    
    <div class="vehicles-table">
      <table>
        <thead>
          <tr>
            <th>车牌号</th>
            <th>品牌</th>
            <th>型号</th>
            <th>年份</th>
            <th>车主</th>
            <th>维修次数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in filteredVehicles" :key="vehicle.id">
            <td>{{ vehicle.licensePlate }}</td>
            <td>{{ vehicle.make }}</td>
            <td>{{ vehicle.model }}</td>
            <td>{{ vehicle.year }}</td>
            <td>{{ vehicle.owner.username }}</td>
            <td>{{ vehicle.repairCount || 0 }}</td>
            <td class="actions">
              <router-link :to="`/admin/vehicles/${vehicle.id}`" class="btn-view">
                查看
              </router-link>
              <button class="btn-delete" @click="confirmDeleteVehicle(vehicle)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showAddForm" class="add-modal">
      <div class="modal-content">
        <h2>添加新车辆</h2>
        <form @submit.prevent="addVehicle">
          <div class="form-group">
            <label>选择车主</label>
            <select v-model="newVehicle.ownerId" required>
              <option value="" disabled>选择车主</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.username }} ({{ user.contactInfo }})
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>车牌号</label>
              <input type="text" v-model="newVehicle.licensePlate" required placeholder="例如: 粤A12345">
            </div>
            
            <div class="form-group">
              <label>品牌</label>
              <input type="text" v-model="newVehicle.make" required placeholder="例如: Toyota">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>型号</label>
              <input type="text" v-model="newVehicle.model" required placeholder="例如: Camry">
            </div>
            
            <div class="form-group">
              <label>年份</label>
              <input type="text" v-model="newVehicle.year" required placeholder="例如: 2020">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">保存</button>
            <button type="button" class="btn-cancel" @click="cancelAdd">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="deletingVehicle" class="delete-modal">
      <div class="modal-content">
        <h2>确认删除车辆</h2>
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
import adminService from '@/services/adminService';
import userService from '@/services/userService';

export default {
  data() {
    return {
      vehicles: [],
      users: [],
      searchQuery: '',
      showAddForm: false,
      deletingVehicle: null,
      newVehicle: {
        ownerId: '',
        licensePlate: '',
        make: '',
        model: '',
        year: ''
      }
    };
  },
  computed: {
    filteredVehicles() {
      if (!this.searchQuery) return this.vehicles;
      const query = this.searchQuery.toLowerCase();
      return this.vehicles.filter(vehicle => 
        vehicle.licensePlate.toLowerCase().includes(query) || 
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query)
      );
    }
  },
  async created() {
    await this.loadVehicles();
    await this.loadUsers();
  },
  methods: {
    async loadVehicles() {
      try {
        this.vehicles = await adminService.getAllVehicles();
      } catch (error) {
        console.error('加载车辆列表失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载车辆列表: ' + error.message
        });
      }
    },
    
    async loadUsers() {
      try {
        this.users = await adminService.getAllUsers();
      } catch (error) {
        console.error('加载用户列表失败:', error);
      }
    },
    
    async addVehicle() {
      try {
        const newVehicle = await adminService.addVehicle(this.newVehicle);
        
        // 添加到本地列表
        this.vehicles.push(newVehicle);
        
        this.$notify.success({
          title: '添加成功',
          message: '车辆已添加'
        });
        
        this.cancelAdd();
      } catch (error) {
        console.error('添加车辆失败:', error);
        this.$notify.error({
          title: '添加失败',
          message: '无法添加车辆: ' + error.message
        });
      }
    },
    
    cancelAdd() {
      this.newVehicle = {
        ownerId: '',
        licensePlate: '',
        make: '',
        model: '',
        year: ''
      };
      this.showAddForm = false;
    },
    
    confirmDeleteVehicle(vehicle) {
      this.deletingVehicle = vehicle;
    },
    
    async deleteVehicle() {
      try {
        await adminService.deleteVehicle(this.deletingVehicle.id);
        
        // 从本地列表中移除
        const index = this.vehicles.findIndex(v => v.id === this.deletingVehicle.id);
        if (index !== -1) {
          this.vehicles.splice(index, 1);
        }
        
        this.$notify.success({
          title: '删除成功',
          message: `车辆 ${this.deletingVehicle.licensePlate} 已删除`
        });
        
        this.deletingVehicle = null;
      } catch (error) {
        console.error('删除车辆失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: '无法删除车辆: ' + error.message
        });
      }
    },
    
    cancelDelete() {
      this.deletingVehicle = null;
    }
  }
};
</script>

<style scoped>
.vehicle-management {
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
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.search-box {
  display: flex;
  width: 300px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px 0 0 6px;
  font-size: 16px;
}

.btn-search {
  background: #3498db;
  color: white;
  border: none;
  padding: 0 15px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
}

.btn-add {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vehicles-table {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.add-modal,
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

.delete-modal .modal-content p {
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>