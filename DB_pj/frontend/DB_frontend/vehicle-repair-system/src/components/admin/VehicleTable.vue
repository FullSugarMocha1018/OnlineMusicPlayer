<template>
  <div class="admin-table-container">
    <div class="table-header">
      <h2 class="table-title">车辆管理</h2>
      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索车牌号、品牌或型号..."
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <button class="add-button" @click="$emit('add-vehicle')">
          <i class="fas fa-plus"></i> 添加车辆
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th @click="sortBy('id')">
              ID <i :class="sortIcon('id')"></i>
            </th>
            <th>车牌号</th>
            <th @click="sortBy('make')">
              品牌 <i :class="sortIcon('make')"></i>
            </th>
            <th @click="sortBy('model')">
              型号 <i :class="sortIcon('model')"></i>
            </th>
            <th @click="sortBy('year')">
              年份 <i :class="sortIcon('year')"></i>
            </th>
            <th>车主</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in paginatedVehicles" :key="vehicle.id">
            <td>{{ vehicle.id }}</td>
            <td>
              <span class="license-plate">{{ vehicle.licensePlate }}</span>
            </td>
            <td>{{ vehicle.make }}</td>
            <td>{{ vehicle.model }}</td>
            <td>{{ vehicle.year }}</td>
            <td>{{ vehicle.owner.username }} (ID:{{ vehicle.owner.id }})</td>
            <td class="actions">
              <button 
                class="view-btn"
                @click="$emit('view-vehicle', vehicle.id)"
                title="查看详情"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="edit-btn"
                @click="$emit('edit-vehicle', vehicle)"
                title="编辑"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="delete-btn"
                @click="$emit('delete-vehicle', vehicle.id)"
                title="删除"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredVehicles.length === 0">
            <td colspan="7" class="no-data">未找到车辆数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="pagination-info">
        显示 {{ pagination.start }} - {{ pagination.end }} 条，共 {{ filteredVehicles.length }} 条
      </div>
      <div class="pagination-controls">
        <button 
          :disabled="pagination.currentPage === 1" 
          @click="pagination.currentPage--"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-number">第 {{ pagination.currentPage }} 页</span>
        <button 
          :disabled="pagination.currentPage >= pageCount" 
          @click="pagination.currentPage++"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="page-size">
        <select v-model="pagination.itemsPerPage" class="page-size-select">
          <option value="5">每页 5 条</option>
          <option value="10">每页 10 条</option>
          <option value="20">每页 20 条</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleTable',
  props: {
    vehicles: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: '',
      sortField: 'id',
      sortDirection: 'asc',
      pagination: {
        currentPage: 1,
        itemsPerPage: 10
      }
    };
  },
  computed: {
    filteredVehicles() {
      let result = [...this.vehicles];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(vehicle => 
          vehicle.licensePlate.toLowerCase().includes(query) || 
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.owner.username.toLowerCase().includes(query)
        );
      }
      
      // 排序
      return result.sort((a, b) => {
        let modifier = 1;
        if (this.sortDirection === 'desc') modifier = -1;
        
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
        return 0;
      });
    },
    paginatedVehicles() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + Number(this.pagination.itemsPerPage);
      return this.filteredVehicles.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredVehicles.length / this.pagination.itemsPerPage);
    },
    pagination: {
      get() {
        return {
          currentPage: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          start: Math.min(
            (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1,
            this.filteredVehicles.length
          ),
          end: Math.min(
            this.pagination.currentPage * this.pagination.itemsPerPage,
            this.filteredVehicles.length
          )
        };
      },
      set(val) {
        this.pagination = val;
      }
    }
  },
  methods: {
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    sortIcon(field) {
      if (this.sortField !== field) return 'fas fa-sort';
      return this.sortDirection === 'asc' 
        ? 'fas fa-sort-up' 
        : 'fas fa-sort-down';
    }
  },
  watch: {
    'pagination.itemsPerPage'() {
      this.pagination.currentPage = 1;
    }
  }
};
</script>

<style scoped>
/* 共用样式已包含在MechanicTable中，此处仅添加特有样式 */

.license-plate {
  display: inline-block;
  padding: 5px 12px;
  background-color: #f0f7ff;
  color: #3498db;
  border-radius: 6px;
  font-weight: 600;
  font-size: 15px;
}
</style>