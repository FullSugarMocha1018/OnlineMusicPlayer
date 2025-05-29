<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="username">用户名</label>
      <input 
        type="text" 
        id="username" 
        v-model="formData.username" 
        required
        placeholder="请输入用户名"
      />
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input 
        type="password" 
        id="password" 
        v-model="formData.password" 
        required
        placeholder="请输入密码"
      />
    </div>

    <div v-if="isRegister" class="form-group">
      <label for="contactInfo">联系方式</label>
      <input 
        type="text" 
        id="contactInfo" 
        v-model="formData.contactInfo" 
        required
        placeholder="邮箱或电话号码"
      />
    </div>

    <div v-if="isRegister" class="form-group">
      <label for="role">用户角色</label>
      <select id="role" v-model="formData.role" required>
        <option value="USER">普通用户</option>
        <option value="MECHANIC">维修人员</option>
      </select>
    </div>

    <button type="submit" class="submit-btn">
      {{ isRegister ? '注册' : '登录' }}
    </button>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </form>
</template>

<script>
export default {
  props: {
    isRegister: Boolean
  },
  data() {
    return {
      formData: {
        username: '',
        password: '',
        contactInfo: '',
        role: 'USER'
      },
      errorMessage: ''
    };
  },
  methods: {
    async handleSubmit() {
      try {
        this.errorMessage = '';
        
        if (this.isRegister) {
          await this.$emit('register', this.formData);
        } else {
          await this.$emit('login', {
            username: this.formData.username,
            password: this.formData.password
          });
        }
      } catch (error) {
        this.errorMessage = error.message || '操作失败，请重试';
      }
    }
  }
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

input, select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, select:focus {
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

.submit-btn:hover {
  background-color: #3aa976;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 4px;
  text-align: center;
}
</style>