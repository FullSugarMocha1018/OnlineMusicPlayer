<template>
  <div class="order-card bg-white rounded-lg shadow-md p-4 mb-4">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-semibold mb-1">工单 #{{ order.id }}</h3>
        <p class="text-gray-600 mb-1">车辆: {{ order.vehicleLicensePlate }}</p>
        <p class="text-gray-600 mb-1">故障类型: {{ order.faultType }}</p>
      </div>
      <div>
        <span :class="statusClass" class="px-2 py-1 rounded-full text-xs font-medium">
          {{ order.status }}
        </span>
      </div>
    </div>
    
    <p class="mt-2 text-gray-700">{{ order.description }}</p>
    
    <div class="mt-3 flex justify-between items-center">
      <div>
        <span class="text-sm text-gray-500">
          提交时间: {{ formatDate(order.submissionTime) }}
        </span>
      </div>
      <button 
        @click="$emit('view-details', order.id)"
        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        查看详情
      </button>
    </div>
    
    <div v-if="order.status === 'Completed' && order.feedback" class="mt-3">
      <div class="flex items-center">
        <span class="text-sm text-gray-600 mr-2">我的评分:</span>
        <div class="flex">
          <span v-for="star in 5" :key="star" class="text-yellow-400">
            {{ star <= order.feedback.rating ? '★' : '☆' }}
          </span>
        </div>
      </div>
      <p class="mt-1 text-sm text-gray-600">评价: {{ order.feedback.comments }}</p>
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
    statusClass() {
      const statusMap = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return statusMap[this.order.status] || 'bg-gray-100 text-gray-800';
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.order-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>