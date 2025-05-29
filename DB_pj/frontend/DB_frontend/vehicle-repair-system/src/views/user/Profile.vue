<template>
  <div class="user-profile">
    <div class="profile-header">
      <h1>个人信息</h1>
      <p>管理您的账户信息</p>
    </div>
    
    <div class="profile-container">
      <div class="profile-card">
        <div class="avatar">
          <div class="avatar-placeholder">{{ userInitials }}</div>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <label>用户名</label>
            <p>{{ user.username }}</p>
          </div>
          
          <div class="info-item">
            <label>联系方式</label>
            <p>{{ user.contactInfo || '未设置' }}</p>
          </div>
          
          <div class="info-item">
            <label>用户角色</label>
            <p>{{ userRole }}</p>
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
          <div class="form-group">
            <label for="contactInfo">联系方式</label>
            <input 
              type="text" 
              id="contactInfo" 
              v-model="updateData.contactInfo" 
              placeholder="输入新的联系方式"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">新密码 (可选)</label>
            <input 
              type="password" 
              id="password" 
              v-model="updateData.password" 
              placeholder="输入新密码"
            >
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="updateData.confirmPassword" 
              placeholder="确认新密码"
            >
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
import userService from '@/services/userService';

export default {
  data() {
    return {
      user: {
        id: null,
        username: '',
        contactInfo: '',
        role: '',
        createdAt: ''
      },
      updateData: {
        contactInfo: '',
        password: '',
        confirmPassword: ''
      },
      updateMessage: '',
      updateSuccess: false
    };
  },
  computed: {
    userInitials() {
      if (this.user.username) {
        return this.user.username.charAt(0).toUpperCase();
      }
      return 'U';
    },
    userRole() {
      switch (this.user.role) {
        case 'USER': return '普通用户';
        case 'MECHANIC': return '维修人员';
        case 'ADMIN': return '系统管理员';
        default: return this.user.role;
      }
    }
  },
  async created() {
    await this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        const userId = this.getCurrentUserId();
        this.user = await userService.getUser(userId);
        this.updateData.contactInfo = this.user.contactInfo;
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },
    
    async updateProfile() {
      // 验证密码是否匹配
      if (this.updateData.password && this.updateData.password !== this.updateData.confirmPassword) {
        this.updateMessage = '两次输入的密码不一致';
        this.updateSuccess = false;
        return;
      }
      
      try {
        const userId = this.getCurrentUserId();
        const updatePayload = {
          contactInfo: this.updateData.contactInfo
        };
        
        // 如果有新密码，添加到更新数据中
        if (this.updateData.password) {
          updatePayload.password = this.updateData.password;
        }
        
        await userService.updateUser(userId, updatePayload);
        
        // 更新本地用户信息
        this.user.contactInfo = this.updateData.contactInfo;
        
        // 更新成功提示
        this.updateMessage = '个人信息更新成功！';
        this.updateSuccess = true;
        
        // 清除密码字段
        this.updateData.password = '';
        this.updateData.confirmPassword = '';
        
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
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.profile-header p {
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
  font-weight: bold;
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

.form-group {
  margin-bottom: 20px;
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
  transition: border-color 0.3s;
}

.form-group input:focus {
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
}
</style>