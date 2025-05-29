<template>
  <div class="user-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>联系方式</th>
          <th>角色</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.contactInfo }}</td>
          <td>
            <span class="role-badge" :class="user.role.toLowerCase()">
              {{ getRoleText(user.role) }}
            </span>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td class="actions">
            <button class="btn-edit" @click="$emit('edit', user)">编辑</button>
            <button class="btn-delete" @click="$emit('delete', user)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getRoleText(role) {
      const roleMap = {
        'USER': '普通用户',
        'MECHANIC': '维修人员',
        'ADMIN': '管理员'
      };
      return roleMap[role] || role;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  }
};
</script>

<style scoped>
.user-table {
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

.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.role-badge.user {
  background-color: #eaf2f8;
  color: #3498db;
}

.role-badge.mechanic {
  background-color: #f9ebfe;
  color: #9b59b6;
}

.role-badge.admin {
  background-color: #e8f6f3;
  color: #1abc9c;
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
</style>