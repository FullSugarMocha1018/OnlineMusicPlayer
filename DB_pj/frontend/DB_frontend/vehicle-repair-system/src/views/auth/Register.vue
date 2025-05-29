<template>
  <div class="register-page">
    <AuthHeader />
    <div class="auth-container">
      <div class="form-section">
        <h2>用户注册</h2>
        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>
        <AuthForm :isRegister="true" @register="handleRegister" />
        <div class="login-link">
          已有账户？<router-link to="/login">立即登录</router-link>
        </div>
      </div>
      
      <div class="info-section">
        <h2>加入车辆维修管理系统</h2>
        <ul class="benefits">
          <li>
            <div class="icon">✅</div>
            <div class="benefit-text">
              <h3>高效管理车辆</h3>
              <p>集中管理您的所有车辆信息，随时查看维修记录</p>
            </div>
          </li>
          <li>
            <div class="icon">⏱️</div>
            <div class="benefit-text">
              <h3>实时维修跟踪</h3>
              <p>随时了解维修进度，避免不必要的等待</p>
            </div>
          </li>
          <li>
            <div class="icon">💬</div>
            <div class="benefit-text">
              <h3>专业反馈机制</h3>
              <p>对维修服务进行评价，帮助我们提升服务质量</p>
            </div>
          </li>
          <li>
            <div class="icon">🔒</div>
            <div class="benefit-text">
              <h3>安全可靠</h3>
              <p>您的数据安全是我们的首要任务</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import AuthHeader from '@/components/auth/AuthHeader.vue';
import AuthForm from '@/components/auth/AuthForm.vue';
import authService from '@/services/authService';

export default {
  components: {
    AuthHeader,
    AuthForm
  },
  data() {
    return {
      registerError: ''
    };
  },
  methods: {
    async handleRegister(userData) {
      this.registerError = '';
      
      try {
        // 1. 注册新用户
        await authService.register(userData);
        
        // 2. 使用新注册的账户自动登录
        const credentials = {
          username: userData.username,
          password: userData.password
        };
        
        await authService.login(credentials);
        
        // 3. 根据用户角色重定向
        const user = authService.getCurrentUser();
        if (user.role === 'ADMIN') {
          this.$router.push('/admin/dashboard');
        } else if (user.role === 'MECHANIC') {
          this.$router.push('/mechanic/dashboard');
        } else {
          this.$router.push('/user/dashboard');
        }
        
      } catch (error) {
        this.registerError = error.message || '注册失败，请重试';
        console.error('注册失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.register-page {
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

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.info-section {
  flex: 1;
  padding: 30px;
  background: linear-gradient(135deg, #2c3e50 0%, #42b983 100%);
  border-radius: 10px;
  color: white;
}

.info-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.benefits {
  list-style: none;
  padding: 0;
}

.benefits li {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.benefits .icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.benefit-text h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.benefit-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
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
}
</style>