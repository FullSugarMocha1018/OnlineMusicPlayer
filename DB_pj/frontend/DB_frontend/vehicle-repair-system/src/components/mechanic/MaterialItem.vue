<template>
  <div class="material-item" :class="{ 'editing': isEditing }">
    <div v-if="!isEditing" class="view-mode">
      <div class="material-info">
        <div class="material-name">
          <span class="label">材料名称:</span>
          <span class="value">{{ material.materialName }}</span>
        </div>
        <div class="material-details">
          <div class="quantity">
            <span class="label">数量:</span>
            <span class="value">{{ material.quantity }}</span>
          </div>
          <div class="price">
            <span class="label">单价:</span>
            <span class="value">¥{{ material.unitPrice.toFixed(2) }}</span>
          </div>
          <div class="total">
            <span class="label">小计:</span>
            <span class="value">¥{{ (material.quantity * material.unitPrice).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="editItem" class="edit-btn">
          <i class="fas fa-edit"></i>
        </button>
        <button @click="deleteItem" class="delete-btn">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <div v-else class="edit-mode">
      <div class="form-group">
        <label for="materialName">材料名称</label>
        <input 
          type="text" 
          id="materialName" 
          v-model="editData.materialName"
          placeholder="输入材料名称"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="quantity">数量</label>
          <input 
            type="number" 
            id="quantity" 
            v-model.number="editData.quantity"
            min="1"
            step="1"
          >
        </div>
        
        <div class="form-group">
          <label for="unitPrice">单价 (¥)</label>
          <input 
            type="number" 
            id="unitPrice" 
            v-model.number="editData.unitPrice"
            min="0"
            step="0.01"
          >
        </div>
      </div>
      
      <div class="total-display">
        小计: ¥{{ (editData.quantity * editData.unitPrice).toFixed(2) }}
      </div>
      
      <div class="edit-actions">
        <button @click="saveChanges" class="save-btn">保存</button>
        <button @click="cancelEdit" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialItem',
  props: {
    material: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      editData: {
        materialName: '',
        quantity: 1,
        unitPrice: 0
      }
    };
  },
  methods: {
    editItem() {
      // 复制原始数据到编辑表单
      this.editData = {
        materialName: this.material.materialName,
        quantity: this.material.quantity,
        unitPrice: this.material.unitPrice
      };
      this.isEditing = true;
    },
    saveChanges() {
      // 验证输入
      if (!this.editData.materialName.trim()) {
        this.$emit('show-error', '材料名称不能为空');
        return;
      }
      
      if (this.editData.quantity <= 0) {
        this.$emit('show-error', '数量必须大于0');
        return;
      }
      
      if (this.editData.unitPrice < 0) {
        this.$emit('show-error', '单价不能为负数');
        return;
      }
      
      // 触发更新事件
      this.$emit('update-material', {
        index: this.index,
        updatedMaterial: this.editData
      });
      
      this.isEditing = false;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    deleteItem() {
      this.$emit('delete-material', this.index);
    }
  }
};
</script>

<style scoped>
.material-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.material-item.editing {
  box-shadow: 0 2px 15px rgba(0, 123, 255, 0.2);
  border: 1px solid #4dabf7;
}

.view-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-info {
  flex: 1;
}

.material-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.material-details {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.material-details > div {
  display: flex;
  gap: 5px;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  font-weight: 500;
  color: #333;
}

.total .value {
  color: #e74c3c;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}

.edit-btn:hover {
  background-color: rgba(52, 152, 219, 0.2);
}

.delete-btn {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.delete-btn:hover {
  background-color: rgba(231, 76, 60, 0.2);
}

/* 编辑模式样式 */
.edit-mode {
  padding: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #444;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #4dabf7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.total-display {
  text-align: right;
  margin: 15px 0;
  font-weight: 600;
  font-size: 16px;
  color: #e74c3c;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background-color: #3498db;
  color: white;
}

.save-btn:hover {
  background-color: #2980b9;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .view-mode {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    margin-top: 12px;
    align-self: flex-end;
  }
  
  .material-details {
    flex-direction: column;
    gap: 5px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>