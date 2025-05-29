<template>
  <div class="mechanic-management">
    <div class="header">
      <h1>维修人员管理</h1>
      <p>管理系统所有维修人员信息</p>
    </div>
    
    <div class="actions">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索维修人员...">
        <button class="btn-search">🔍</button>
      </div>
      <button class="btn-add" @click="showAddForm = true">
        <i class="icon">+</i> 添加维修人员
      </button>
    </div>
    
    <div class="mechanics-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>用户名</th>
            <th>工种</th>
            <th>时薪 (¥)</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mechanic in filteredMechanics" :key="mechanic.id">
            <td>{{ mechanic.id }}</td>
            <td>{{ mechanic.name }}</td>
            <td>{{ mechanic.user.username }}</td>
            <td>
              <span class="specialty-badge">{{ mechanic.specialty }}</span>
            </td>
            <td>{{ mechanic.hourlyRate.toFixed(2) }}</td>
            <td>{{ formatDate(mechanic.user.createdAt) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="editMechanic(mechanic)">编辑</button>
              <button class="btn-delete" @click="confirmDeleteMechanic(mechanic)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showAddForm" class="add-modal">
      <div class="modal-content">
        <h2>添加维修人员</h2>
        <form @submit.prevent="addMechanic">
          <div class="form-group">
            <label>选择用户</label>
            <select v-model="newMechanic.userId" required>
              <option value="" disabled>选择用户</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.username }} ({{ user.contactInfo }})
              </option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="newMechanic.name" required placeholder="输入姓名">
            </div>
            
            <div class="form-group">
              <label>工种</label>
              <select v-model="newMechanic.specialty" required>
                <option value="">选择工种</option>
                <option value="机修">机修</option>
                <option value="电气">电气</option>
                <option value="钣金">钣金</option>
                <option value="喷漆">喷漆</option>
                <option value="轮胎">轮胎</option>
                <option value="保养">保养</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>时薪 (¥)</label>
            <input type="number" v-model.number="newMechanic.hourlyRate" min="0" step="0.01" required placeholder="输入时薪">
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">保存</button>
            <button type="button" class="btn-cancel" @click="cancelAdd">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="editingMechanic" class="edit-modal">
      <div class="modal-content">
        <h2>编辑维修人员信息</h2>
        <form @submit.prevent="updateMechanic">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="editingMechanic.name" required>
          </div>
          
          <div class="form-group">
            <label>工种</label>
            <select v-model="editingMechanic.specialty" required>
              <option value="机修">机修</option>
              <option value="电气">电气</option>
              <option value="钣金">钣金</option>
              <option value="喷漆">喷漆</option>
              <option value="轮胎">轮胎</option>
              <option value="保养">保养</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>时薪 (¥)</label>
            <input type="number" v-model.number="editingMechanic.hourlyRate" min="0" step="0.01" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">保存更改</button>
            <button type="button" class="btn-cancel" @click="cancelEdit">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="deletingMechanic" class="delete-modal">
      <div class="modal-content">
        <h2>确认删除维修人员</h2>
        <p>确定要删除维修人员 <strong>{{ deletingMechanic.name }}</strong> 吗？此操作不可逆。</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="deleteMechanic">确认删除</button>
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
      mechanics: [],
      users: [],
      searchQuery: '',
      showAddForm: false,
      editingMechanic: null,
      deletingMechanic: null,
      newMechanic: {
        userId: '',
        name: '',
        specialty: '',
        hourlyRate: 0
      }
    };
  },
  computed: {
    filteredMechanics() {
      if (!this.searchQuery) return this.mechanics;
      const query = this.searchQuery.toLowerCase();
      return this.mechanics.filter(mechanic => 
        mechanic.name.toLowerCase().includes(query) || 
        mechanic.user.username.toLowerCase().includes(query) ||
        mechanic.specialty.toLowerCase().includes(query)
      );
    },
    availableUsers() {
      // 过滤掉已经是维修人员的用户
      const mechanicUserIds = this.mechanics.map(m => m.user.id);
      return this.users.filter(user => 
        user.role === 'MECHANIC' && !mechanicUserIds.includes(user.id)
      );
    }
  },
  async created() {
    await this.loadMechanics();
    await this.loadUsers();
  },
  methods: {
    async loadMechanics() {
      try {
        this.mechanics = await adminService.getAllMechanics();
      } catch (error) {
        console.error('加载维修人员列表失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载维修人员列表: ' + error.message
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
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    
    editMechanic(mechanic) {
      this.editingMechanic = { ...mechanic };
    },
    
    async updateMechanic() {
      try {
        const updatedMechanic = await adminService.updateMechanic(
          this.editingMechanic.id, 
          {
            name: this.editingMechanic.name,
            specialty: this.editingMechanic.specialty,
            hourlyRate: this.editingMechanic.hourlyRate
          }
        );
        
        // 更新本地列表
        const index = this.mechanics.findIndex(m => m.id === updatedMechanic.id);
        if (index !== -1) {
          this.mechanics.splice(index, 1, updatedMechanic);
        }
        
        this.$notify.success({
          title: '更新成功',
          message: '维修人员信息已更新'
        });
        
        this.editingMechanic = null;
      } catch (error) {
        console.error('更新维修人员失败:', error);
        this.$notify.error({
          title: '更新失败',
          message: '无法更新维修人员信息: ' + error.message
        });
      }
    },
    
    cancelEdit() {
      this.editingMechanic = null;
    },
    
    confirmDeleteMechanic(mechanic) {
      this.deletingMechanic = mechanic;
    },
    
    async deleteMechanic() {
      try {
        await adminService.deleteMechanic(this.deletingMechanic.id);
        
        // 从本地列表中移除
        const index = this.mechanics.findIndex(m => m.id === this.deletingMechanic.id);
        if (index !== -1) {
          this.mechanics.splice(index, 1);
        }
        
        this.$notify.success({
          title: '删除成功',
          message: `维修人员 ${this.deletingMechanic.name} 已删除`
        });
        
        this.deletingMechanic = null;
      } catch (error) {
        console.error('删除维修人员失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: '无法删除维修人员: ' + error.message
        });
      }
    },
    
    cancelDelete() {
      this.deletingMechanic = null;
    },
    
    async addMechanic() {
      try {
        const newMechanic = await adminService.updateMechanic(
          this.newMechanic.userId, 
          {
            name: this.newMechanic.name,
            specialty: this.newMechanic.specialty,
            hourlyRate: this.newMechanic.hourlyRate
          }
        );
        
        // 添加到本地列表
        this.mechanics.push(newMechanic);
        
        this.$notify.success({
          title: '添加成功',
          message: '维修人员已添加'
        });
        
        this.cancelAdd();
      } catch (error) {
        console.error('添加维修人员失败:', error);
        this.$notify.error({
          title: '添加失败',
          message: '无法添加维修人员: ' + error.message
        });
      }
    },
    
    cancelAdd() {
      this.newMechanic = {
        userId: '',
        name: '',
        specialty: '',
        hourlyRate: 0
      };
      this.showAddForm = false;
    }
  }
};
</script>

<style scoped>
.mechanic-management {
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

.mechanics-table {
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

.specialty-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  background-color: #e8f4ff;
  color: #3498db;
  font-size: 13px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.add-modal,
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