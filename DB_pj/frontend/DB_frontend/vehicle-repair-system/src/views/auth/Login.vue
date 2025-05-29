<template>
  <div class="login-page">
    <AuthHeader />
    <div class="auth-container">
      <div class="welcome-section">
        <h2>欢迎回来</h2>
        <p>请登录您的账户以访问车辆维修管理系统</p>
        <div class="features">
          <div class="feature">
            <div class="icon">🚗</div>
            <h3>车辆管理</h3>
            <p>轻松管理您的所有车辆信息</p>
          </div>
          <div class="feature">
            <div class="icon">🔧</div>
            <h3>维修跟踪</h3>
            <p>实时查看维修进度和状态</p>
          </div>
          <div class="feature">
            <div class="icon">📊</div>
            <h3>历史记录</h3>
            <p>完整保存您的维修历史</p>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h2>用户登录</h2>
        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginData.username" 
              required
              placeholder="请输入用户名"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginData.password" 
              required
              placeholder="请输入密码"
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <div class="register-link">
            还没有账户？<router-link to="/register">立即注册</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AuthHeader from '@/components/auth/AuthHeader.vue';
import authService from '@/services/authService';

export default {
  components: {
    AuthHeader
  },
  data() {
    return {
      loginData: {
        username: '',
        password: ''
      },
      loading: false,
      loginError: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.loginError = '';
      
      try {
        await authService.login(this.loginData);
        
        // 根据用户角色重定向到不同页面
        const user = authService.getCurrentUser();
        if (user.role === 'ADMIN') {
          this.$router.push('/admin/dashboard');
        } else if (user.role === 'MECHANIC') {
          this.$router.push('/mechanic/dashboard');
        } else {
          this.$router.push('/user/dashboard');
        }
      } catch (error) {
        this.loginError = error.message || '登录失败，请检查用户名和密码';
        console.error('登录失败:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.auth-container {
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  gap: 40px;
}

.welcome-section {
  flex: 1;
  padding: 30px;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  border-radius: 10px;
  color: white;
}

.welcome-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.welcome-section p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.feature .icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature h3 {
  margin: 10px 0;
  font-size: 1.2rem;
}

.feature p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.form-section {
  flex: 1;
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #3aa976;
}

.submit-btn:disabled {
  background-color: #a0d9bb;
  cursor: not-allowed;
}

.register-link {
  margin-top: 15px;
  text-align: center;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 900px) {
  .auth-container {
    flex-direction: column;
  }
  
  .welcome-section {
    text-align: center;
  }
}
</style>