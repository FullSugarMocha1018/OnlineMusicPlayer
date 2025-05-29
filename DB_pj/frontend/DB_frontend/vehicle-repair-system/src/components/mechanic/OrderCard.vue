<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-id">工单 #{{ order.id }}</div>
      <div class="order-date">{{ formatDate(order.createdAt) }}</div>
    </div>
    
    <div class="order-content">
      <h3>{{ order.description }}</h3>
      <p><strong>故障类型:</strong> {{ order.faultType }}</p>
      
      <div class="vehicle-info">
        <div class="vehicle-make">{{ order.vehicle.make }} {{ order.vehicle.model }}</div>
        <div class="vehicle-plate">{{ order.vehicle.licensePlate }}</div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="order-status">
        <span class="status-badge" :class="statusClass">{{ statusText }}</span>
      </div>
      
      <div class="order-actions">
        <button v-if="order.status === 'Pending'" class="btn-accept" @click="$emit('accept')">
          接受
        </button>
        <button v-if="order.status === 'Pending'" class="btn-reject" @click="$emit('reject')">
          拒绝
        </button>
        <button v-if="order.status === 'In Progress'" class="btn-view" @click="$emit('view')">
          查看
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        'Pending': '待处理',
        'Accepted': '已接受',
        'In Progress': '进行中',
        'Completed': '已完成',
        'Rejected': '已拒绝'
      };
      return statusMap[this.order.status] || this.order.status;
    },
    statusClass() {
      return this.order.status.toLowerCase().replace(' ', '-');
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  }
};
</script>

<style scoped>
.order-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.order-date {
  font-size: 13px;
  color: #7f8c8d;
}

.order-content {
  padding: 15px;
}

.order-content h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.4;
}

.order-content p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #7f8c8d;
}

.vehicle-info {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 14px;
}

.vehicle-make {
  font-weight: 500;
  color: #2c3e50;
}

.vehicle-plate {
  background: #eaf2f8;
  color: #3498db;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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

.order-actions {
  display: flex;
  gap: 8px;
}

.order-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-accept {
  background: #eafaf1;
  color: #27ae60;
}

.btn-reject {
  background: #fdedec;
  color: #e74c3c;
}

.btn-view {
  background: #ebf5fb;
  color: #3498db;
}
</style>