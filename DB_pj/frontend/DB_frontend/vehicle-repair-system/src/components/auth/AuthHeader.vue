<template>
  <header class="auth-header">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="车辆维修管理系统" class="logo" />
      <h1>车辆维修管理系统</h1>
    </div>
    <div class="auth-links">
      <router-link to="/login" v-if="!isLoginPage">登录</router-link>
      <router-link to="/register" v-if="isLoginPage">注册</router-link>
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    isLoginPage() {
      return this.$route.path === '/login';
    }
  }
};
</script>

<style scoped>
.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  height: 50px;
  width: auto;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 4px;
  background-color: #42b983;
  transition: background-color 0.3s;
}

.auth-links a:hover {
  background-color: #3aa976;
}
</style>