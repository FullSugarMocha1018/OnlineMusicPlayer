<template>
  <div class="user-management">
    <div class="header">
      <h1>用户管理</h1>
      <p>管理系统所有注册用户</p>
    </div>
    
    <div class="actions">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜索用户...">
        <button class="btn-search">🔍</button>
      </div>
      <button class="btn-export">导出数据</button>
    </div>
    
    <div class="user-table">
      <UserTable 
        :users="filteredUsers" 
        @edit="editUser"
        @delete="confirmDeleteUser"
      />
    </div>
    
    <div v-if="editingUser" class="edit-modal">
      <div class="modal-content">
        <h2>编辑用户信息</h2>
        <form @submit.prevent="updateUser">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="editingUser.username" disabled>
          </div>
          
          <div class="form-group">
            <label>联系方式</label>
            <input type="text" v-model="editingUser.contactInfo">
          </div>
          
          <div class="form-group">
            <label>用户角色</label>
            <select v-model="editingUser.role">
              <option value="USER">普通用户</option>
              <option value="MECHANIC">维修人员</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">保存更改</button>
            <button type="button" class="btn-cancel" @click="cancelEdit">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="deletingUser" class="delete-modal">
      <div class="modal-content">
        <h2>确认删除用户</h2>
        <p>确定要删除用户 <strong>{{ deletingUser.username }}</strong> 吗？此操作不可逆。</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="deleteUser">确认删除</button>
          <button class="btn-cancel" @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminService from '@/services/adminService';
import UserTable from '@/components/admin/UserTable.vue';

export default {
  components: {
    UserTable
  },
  data() {
    return {
      users: [],
      searchQuery: '',
      editingUser: null,
      deletingUser: null
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user => 
        user.username.toLowerCase().includes(query) || 
        user.contactInfo.toLowerCase().includes(query)
      );
    }
  },
  async created() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.users = await adminService.getAllUsers();
      } catch (error) {
        console.error('加载用户列表失败:', error);
        this.$notify.error({
          title: '加载失败',
          message: '无法加载用户列表: ' + error.message
        });
      }
    },
    
    editUser(user) {
      this.editingUser = { ...user };
    },
    
    async updateUser() {
      try {
        const updatedUser = await adminService.updateUser(this.editingUser.id, {
          contactInfo: this.editingUser.contactInfo,
          role: this.editingUser.role
        });
        
        // 更新本地用户列表
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser);
        }
        
        this.$notify.success({
          title: '更新成功',
          message: '用户信息已更新'
        });
        
        this.editingUser = null;
      } catch (error) {
        console.error('更新用户失败:', error);
        this.$notify.error({
          title: '更新失败',
          message: '无法更新用户信息: ' + error.message
        });
      }
    },
    
    cancelEdit() {
      this.editingUser = null;
    },
    
    confirmDeleteUser(user) {
      this.deletingUser = user;
    },
    
    async deleteUser() {
      try {
        await adminService.deleteUser(this.deletingUser.id);
        
        // 从本地用户列表中移除
        const index = this.users.findIndex(u => u.id === this.deletingUser.id);
        if (index !== -1) {
          this.users.splice(index, 1);
        }
        
        this.$notify.success({
          title: '删除成功',
          message: `用户 ${this.deletingUser.username} 已删除`
        });
        
        this.deletingUser = null;
      } catch (error) {
        console.error('删除用户失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: '无法删除用户: ' + error.message
        });
      }
    },
    
    cancelDelete() {
      this.deletingUser = null;
    }
  }
};
</script>

<style scoped>
.user-management {
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

.btn-export {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
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
</style>