<template>
  <div class="vehicle-card">
    <div class="card-header">
      <h3>{{ vehicle.make }} {{ vehicle.model }}</h3>
      <div class="license-plate">{{ vehicle.licensePlate }}</div>
    </div>
    
    <div class="card-details">
      <div class="detail-item">
        <span class="label">年份</span>
        <span class="value">{{ vehicle.year }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">状态</span>
        <span class="value">正常</span>
      </div>
      
      <div class="detail-item">
        <span class="label">维修记录</span>
        <span class="value">5 次</span>
      </div>
    </div>
    
    <div class="card-actions">
      <router-link :to="`/user/vehicles/${vehicle.id}`" class="btn-view">
        查看详情
      </router-link>
      
      <div class="action-buttons">
        <button class="btn-edit" @click="$emit('edit', vehicle)">
          <i class="edit-icon">✏️</i>
        </button>
        <button class="btn-delete" @click="$emit('delete', vehicle)">
          <i class="delete-icon">🗑️</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    vehicle: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.vehicle-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vehicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #3498db, #1abc9c);
  color: white;
  padding: 20px;
  text-align: center;
}

.card-header h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.license-plate {
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.card-details {
  padding: 20px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #7f8c8d;
  font-weight: 500;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-view {
  background-color: #3498db;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-view:hover {
  background-color: #2980b9;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-edit:hover, .btn-delete:hover {
  transform: scale(1.1);
}

.btn-edit {
  background-color: #f1c40f;
}

.btn-delete {
  background-color: #e74c3c;
}
</style>