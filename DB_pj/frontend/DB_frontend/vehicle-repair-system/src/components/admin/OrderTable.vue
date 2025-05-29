<template>
  <div class="admin-table-container">
    <div class="table-header">
      <h2 class="table-title">维修工单管理</h2>
      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索工单、车辆或用户..."
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">所有状态</option>
            <option value="Pending">待处理</option>
            <option value="In Progress">进行中</option>
            <option value="Completed">已完成</option>
            <option value="Cancelled">已取消</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th @click="sortBy('id')">
              ID <i :class="sortIcon('id')"></i>
            </th>
            <th>车辆信息</th>
            <th>故障类型</th>
            <th @click="sortBy('submissionTime')">
              提交时间 <i :class="sortIcon('submissionTime')"></i>
            </th>
            <th>状态</th>
            <th>维修费用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>
              <div class="vehicle-info">
                <div class="license-plate">{{ order.vehicleLicensePlate }}</div>
                <div class="vehicle-model">{{ order.vehicleMake }} {{ order.vehicleModel }}</div>
              </div>
            </td>
            <td>{{ order.faultType }}</td>
            <td>{{ formatDate(order.submissionTime) }}</td>
            <td>
              <span :class="statusClass(order.status)">{{ order.status }}</span>
            </td>
            <td>
              <div v-if="order.totalCost" class="cost-cell">
                ¥{{ order.totalCost.toFixed(2) }}
                <div class="cost-breakdown">
                  人工: ¥{{ order.laborCost?.toFixed(2) || '0.00' }}
                  材料: ¥{{ order.materialCost?.toFixed(2) || '0.00' }}
                </div>
              </div>
              <span v-else class="text-muted">未计算</span>
            </td>
            <td class="actions">
              <button 
                class="view-btn"
                @click="$emit('view-order', order.id)"
                title="查看详情"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="edit-btn"
                @click="$emit('edit-order', order)"
                title="编辑"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="delete-btn"
                @click="$emit('delete-order', order.id)"
                title="删除"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="7" class="no-data">未找到维修工单数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="pagination-info">
        显示 {{ pagination.start }} - {{ pagination.end }} 条，共 {{ filteredOrders.length }} 条
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
  name: 'OrderTable',
  props: {
    orders: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      sortField: 'id',
      sortDirection: 'asc',
      pagination: {
        currentPage: 1,
        itemsPerPage: 10
      }
    };
  },
  computed: {
    filteredOrders() {
      let result = [...this.orders];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(order => 
          order.id.toString().includes(query) ||
          order.vehicleLicensePlate.toLowerCase().includes(query) ||
          order.vehicleMake.toLowerCase().includes(query) ||
          order.vehicleModel.toLowerCase().includes(query) ||
          order.userName.toLowerCase().includes(query) ||
          order.faultType.toLowerCase().includes(query)
        );
      }
      
      // 状态过滤
      if (this.statusFilter) {
        result = result.filter(order => order.status === this.statusFilter);
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
    paginatedOrders() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + Number(this.pagination.itemsPerPage);
      return this.filteredOrders.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredOrders.length / this.pagination.itemsPerPage);
    },
    pagination: {
      get() {
        return {
          currentPage: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          start: Math.min(
            (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1,
            this.filteredOrders.length
          ),
          end: Math.min(
            this.pagination.currentPage * this.pagination.itemsPerPage,
            this.filteredOrders.length
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
    },
    statusClass(status) {
      const classes = {
        'status-badge': true,
        'pending': status === 'Pending',
        'in-progress': status === 'In Progress',
        'completed': status === 'Completed',
        'cancelled': status === 'Cancelled'
      };
      return classes;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
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

.vehicle-info {
  display: flex;
  flex-direction: column;
}

.license-plate {
  font-weight: 600;
  font-size: 15px;
}

.vehicle-model {
  font-size: 13px;
  color: #6c757d;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.in-progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.cost-cell {
  font-weight: 600;
  color: #27ae60;
}

.cost-breakdown {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 3px;
  display: flex;
  gap: 8px;
}

.text-muted {
  color: #95a5a6;
  font-style: italic;
}

.view-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  color: #3498db;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background-color: #3498db;
  color: white;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
  min-width: 150px;
}

.filters {
  display: flex;
  gap: 10px;
}
</style>