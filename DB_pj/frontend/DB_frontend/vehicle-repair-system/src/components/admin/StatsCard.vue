<template>
  <div class="stats-card" :style="{borderLeft: `4px solid ${color}`}">
    <div class="card-icon" :style="{backgroundColor: color}">
      {{ icon }}
    </div>
    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-value">{{ value }}</div>
      <div v-if="change" class="card-change" :class="changeClass">
        {{ change }} <span v-if="changeType">{{ changeType }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [Number, String],
    icon: String,
    color: {
      type: String,
      default: '#3498db'
    },
    change: String,
    changeType: String
  },
  computed: {
    changeClass() {
      if (!this.change) return '';
      return this.change.startsWith('+') ? 'positive' : 'negative';
    }
  }
};
</script>

<style scoped>
.stats-card {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-icon {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
}

.card-content {
  flex: 1;
  padding: 20px;
}

.card-title {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.card-change {
  font-size: 14px;
  font-weight: 500;
}

.card-change.positive {
  color: #2ecc71;
}

.card-change.negative {
  color: #e74c3c;
}
</style>