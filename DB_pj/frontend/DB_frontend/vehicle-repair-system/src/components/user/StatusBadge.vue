<template>
  <span class="status-badge" :class="statusClass">{{ statusText }}</span>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: 'Pending'
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        'Pending': '待处理',
        'Accepted': '已接受',
        'In Progress': '维修中',
        'Completed': '已完成',
        'Canceled': '已取消'
      };
      return statusMap[this.status] || this.status;
    },
    statusClass() {
      return this.status.toLowerCase().replace(' ', '-');
    }
  }
};
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.status-badge.pending {
  background-color: #fef9e7;
  color: #b7950b;
  border: 1px solid #f4d03f;
}

.status-badge.accepted {
  background-color: #eafaf1;
  color: #27ae60;
  border: 1px solid #2ecc71;
}

.status-badge.in-progress {
  background-color: #ebf5fb;
  color: #2874a6;
  border: 1px solid #3498db;
}

.status-badge.completed {
  background-color: #e8f8f5;
  color: #1d8348;
  border: 1px solid #2ecc71;
}

.status-badge.canceled {
  background-color: #fdedec;
  color: #c0392b;
  border: 1px solid #e74c3c;
}
</style>