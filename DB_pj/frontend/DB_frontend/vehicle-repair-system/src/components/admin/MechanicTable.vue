<template>
  <div class="admin-table-container">
    <div class="table-header">
      <h2 class="table-title">维修人员管理</h2>
      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索维修人员..."
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <button class="add-button" @click="$emit('add-mechanic')">
          <i class="fas fa-plus"></i> 添加维修人员
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
            <th @click="sortBy('name')">
              姓名 <i :class="sortIcon('name')"></i>
            </th>
            <th @click="sortBy('specialty')">
              工种 <i :class="sortIcon('specialty')"></i>
            </th>
            <th @click="sortBy('hourlyRate')">
              时薪 <i :class="sortIcon('hourlyRate')"></i>
            </th>
            <th>关联用户</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mechanic in paginatedMechanics" :key="mechanic.id">
            <td>{{ mechanic.id }}</td>
            <td>{{ mechanic.name }}</td>
            <td>
              <span class="specialty-badge">{{ mechanic.specialty }}</span>
            </td>
            <td>¥{{ mechanic.hourlyRate.toFixed(2) }}</td>
            <td>{{ mechanic.user.username }} (ID:{{ mechanic.user.id }})</td>
            <td class="actions">
              <button 
                class="edit-btn"
                @click="$emit('edit-mechanic', mechanic)"
                title="编辑"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="delete-btn"
                @click="$emit('delete-mechanic', mechanic.id)"
                title="删除"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredMechanics.length === 0">
            <td colspan="6" class="no-data">未找到维修人员数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="pagination-info">
        显示 {{ pagination.start }} - {{ pagination.end }} 条，共 {{ filteredMechanics.length }} 条
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
  name: 'MechanicTable',
  props: {
    mechanics: {
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
    filteredMechanics() {
      let result = [...this.mechanics];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(m => 
          m.name.toLowerCase().includes(query) || 
          m.specialty.toLowerCase().includes(query) ||
          m.user.username.toLowerCase().includes(query)
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
    paginatedMechanics() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + Number(this.pagination.itemsPerPage);
      return this.filteredMechanics.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredMechanics.length / this.pagination.itemsPerPage);
    },
    pagination: {
      get() {
        return {
          currentPage: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          start: Math.min(
            (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1,
            this.filteredMechanics.length
          ),
          end: Math.min(
            this.pagination.currentPage * this.pagination.itemsPerPage,
            this.filteredMechanics.length
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
.admin-table-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 30px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.table-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.table-controls {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 250px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #95a5a6;
}

.add-button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  text-align: left;
  padding: 15px;
  border-bottom: 2px solid #e9ecef;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.admin-table th:hover {
  background-color: #e9f7fe;
}

.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.admin-table tr:hover td {
  background-color: #f8f9fa;
}

.specialty-badge {
  display: inline-block;
  padding: 5px 12px;
  background-color: #e1f0fa;
  color: #3498db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #f0f7ff;
  color: #3498db;
}

.edit-btn:hover {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #fff0f0;
  color: #e74c3c;
}

.delete-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
  font-style: italic;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:not(:disabled):hover {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  font-size: 14px;
  color: #495057;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-select {
  padding: 8px 15px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .table-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .add-button {
    width: 100%;
    justify-content: center;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-controls {
    order: 1;
  }
  
  .page-size {
    order: 2;
  }
  
  .pagination-info {
    order: 3;
    width: 100%;
    text-align: center;
  }
}
</style>