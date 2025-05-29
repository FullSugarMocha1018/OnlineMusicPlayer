<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

export default {
  props: {
    type: {
      type: String,
      default: 'bar'
    },
    data: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.renderChart();
  },
  watch: {
    data: {
      deep: true,
      handler() {
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }
        this.renderChart();
      }
    }
  },
  methods: {
    renderChart() {
      Chart.register(...registerables);
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>