<template>
  <div class="mechanic-profile">
    <div class="header">
      <h1>个人信息</h1>
      <p>管理您的维修人员账户信息</p>
    </div>
    
    <div class="profile-container">
      <div class="profile-card">
        <div class="avatar">
          <div class="avatar-placeholder">🔧</div>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <label>用户名</label>
            <p>{{ user.username }}</p>
          </div>
          
          <div class="info-item">
            <label>姓名</label>
            <p>{{ mechanic.name || '未设置' }}</p>
          </div>
          
          <div class="info-item">
            <label>工种</label>
            <p>{{ mechanic.specialty || '未设置' }}</p>
          </div>
          
          <div class="info-item">
            <label>时薪</label>
            <p>¥{{ mechanic.hourlyRate?.toFixed(2) || '0.00' }}</p>
          </div>
          
          <div class="info-item">
            <label>注册时间</label>
            <p>{{ formatDate(user.createdAt) }}</p>
          </div>
        </div>
      </div>
      
      <div class="update-form">
        <h2>更新个人信息</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-row">
            <div class="form-group">
              <label for="name">姓名</label>
              <input 
                type="text" 
                id="name" 
                v-model="updateData.name" 
                placeholder="输入您的姓名"
              >
            </div>
            
            <div class="form-group">
              <label for="specialty">工种</label>
              <select id="specialty" v-model="updateData.specialty">
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
          
          <div class="form-row">
            <div class="form-group">
              <label for="hourlyRate">时薪 (¥)</label>
              <input 
                type="number" 
                id="hourlyRate" 
                v-model.number="updateData.hourlyRate" 
                placeholder="输入您的时薪"
                min="0"
                step="0.01"
              >
            </div>
          </div>
          
          <button type="submit" class="btn-update">更新信息</button>
          
          <div v-if="updateMessage" class="message" :class="{'success': updateSuccess, 'error': !updateSuccess}">
            {{ updateMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import mechanicService from '@/services/mechanicService';
import userService from '@/services/userService';

export default {
  data() {
    return {
      user: {
        id: null,
        username: '',
        createdAt: ''
      },
      mechanic: {
        id: null,
        name: '',
        specialty: '',
        hourlyRate: 0
      },
      updateData: {
        name: '',
        specialty: '',
        hourlyRate: 0
      },
      updateMessage: '',
      updateSuccess: false
    };
  },
  async created() {
    await this.loadUserData();
    await this.loadMechanicData();
  },
  methods: {
    async loadUserData() {
      try {
        const userId = this.getCurrentUserId();
        this.user = await userService.getUser(userId);
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },
    
    async loadMechanicData() {
      try {
        const userId = this.getCurrentUserId();
        this.mechanic = await mechanicService.getMechanic(userId);
        this.updateData = {
          name: this.mechanic.name || '',
          specialty: this.mechanic.specialty || '',
          hourlyRate: this.mechanic.hourlyRate || 0
        };
      } catch (error) {
        console.error('加载维修人员信息失败:', error);
      }
    },
    
    async updateProfile() {
      if (!this.updateData.specialty) {
        this.updateMessage = '请选择您的工种';
        this.updateSuccess = false;
        return;
      }
      
      if (this.updateData.hourlyRate <= 0) {
        this.updateMessage = '时薪必须大于0';
        this.updateSuccess = false;
        return;
      }
      
      try {
        await mechanicService.updateMechanic(this.mechanic.id, this.updateData);
        
        // 更新本地数据
        this.mechanic.name = this.updateData.name;
        this.mechanic.specialty = this.updateData.specialty;
        this.mechanic.hourlyRate = this.updateData.hourlyRate;
        
        this.updateMessage = '个人信息更新成功！';
        this.updateSuccess = true;
        
        // 3秒后清除消息
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
        
      } catch (error) {
        this.updateMessage = '更新失败: ' + error.message;
        this.updateSuccess = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '未知';
      return new Date(dateString).toLocaleDateString();
    },
    
    getCurrentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user.id;
    }
  }
};
</script>

<style scoped>
.mechanic-profile {
  max-width: 1000px;
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

.profile-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 30px;
}

.profile-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  text-align: center;
}

.avatar {
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3498db, #1abc9c);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
}

.profile-info {
  text-align: left;
}

.info-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  display: block;
  font-weight: 500;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.info-item p {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.update-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.update-form h2 {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.btn-update {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-update:hover {
  background-color: #3aa976;
}

.message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>