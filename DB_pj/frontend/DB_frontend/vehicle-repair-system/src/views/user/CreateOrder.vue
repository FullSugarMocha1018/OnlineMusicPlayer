<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">提交维修工单</h1>
      <router-link 
        to="/user/repair-orders" 
        class="text-blue-600 hover:text-blue-800"
      >
        返回工单列表
      </router-link>
    </div>

    <div v-if="loadingVehicles" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <form v-else @submit.prevent="submitOrder" class="bg-white rounded-lg shadow-md p-6">
      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2" for="vehicle">
          选择车辆 <span class="text-red-500">*</span>
        </label>
        <select 
          v-model="form.vehicleId"
          id="vehicle"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>请选择车辆</option>
          <option 
            v-for="vehicle in vehicles" 
            :key="vehicle.id" 
            :value="vehicle.id"
          >
            {{ vehicle.licensePlate }} ({{ vehicle.make }} {{ vehicle.model }} {{ vehicle.year }})
          </option>
        </select>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2" for="faultType">
          故障类型 <span class="text-red-500">*</span>
        </label>
        <input 
          v-model="form.faultType"
          type="text"
          id="faultType"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例如：发动机异响、刹车问题等"
          required
        />
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2" for="description">
          问题描述 <span class="text-red-500">*</span>
        </label>
        <textarea 
          v-model="form.description"
          id="description"
          rows="5"
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请详细描述您遇到的问题..."
          required
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button 
          type="button" 
          @click="$router.push('/user/repair-orders')"
          class="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button 
          type="submit"
          :disabled="submitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <span v-if="submitting">提交中...</span>
          <span v-else>提交工单</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { getVehiclesByUser } from '@/services/vehicleService';
import { submitRepairOrder } from '@/services/repairOrderService';

export default {
  data() {
    return {
      loadingVehicles: true,
      submitting: false,
      vehicles: [],
      form: {
        vehicleId: '',
        faultType: '',
        description: ''
      }
    };
  },
  async mounted() {
    await this.fetchVehicles();
  },
  methods: {
    async fetchVehicles() {
      try {
        this.loadingVehicles = true;
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const response = await getVehiclesByUser(userId);
        this.vehicles = response.data;
        
        if (this.vehicles.length > 0) {
          this.form.vehicleId = this.vehicles[0].id;
        }
      } catch (error) {
        console.error('获取车辆信息失败:', error);
        this.$toast.error('获取车辆信息失败，请稍后重试');
      } finally {
        this.loadingVehicles = false;
      }
    },
    async submitOrder() {
      try {
        this.submitting = true;
        const userId = JSON.parse(localStorage.getItem('user')).id;
        
        const orderData = {
          description: this.form.description,
          faultType: this.form.faultType,
          vehicleId: this.form.vehicleId,
          userId: userId
        };
        
        const response = await submitRepairOrder(orderData);
        this.$toast.success('工单提交成功！');
        
        // 延迟跳转让用户看到成功消息
        setTimeout(() => {
          this.$router.push({ 
            name: 'RepairOrderDetail', 
            params: { id: response.data.id } 
          });
        }, 1500);
      } catch (error) {
        console.error('提交工单失败:', error);
        this.$toast.error('提交工单失败，请稍后重试');
      } finally {
        this.submitting = false;
      }
    }
  }
}
</script>