<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">我的维修工单</h1>
      <router-link 
        to="/user/create-order" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        提交新工单
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <div v-if="orders.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">您还没有提交过维修工单</p>
        <router-link 
          to="/user/create-order" 
          class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          提交第一个工单
        </router-link>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OrderCard 
            v-for="order in orders" 
            :key="order.id" 
            :order="order"
            @view-details="viewOrderDetails"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderCard from '@/components/user/OrderCard.vue';
import { getRepairOrdersByUser } from '@/services/repairOrderService';

export default {
  components: {
    OrderCard
  },
  data() {
    return {
      loading: true,
      orders: []
    };
  },
  async mounted() {
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await getRepairOrdersByUser(userId);
        this.orders = response.data;
      } catch (error) {
        console.error('获取维修工单失败:', error);
        this.$toast.error('获取维修工单失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    viewOrderDetails(orderId) {
      this.$router.push({ name: 'RepairOrderDetail', params: { id: orderId } });
    }
  }
}
</script>