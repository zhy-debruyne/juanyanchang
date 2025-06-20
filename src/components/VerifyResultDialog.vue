<!-- VerifyResultDialog.vue -->
<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="验证结果" 
    width="800px"
    class="verify-dialog"
  >
    <div class="dialog-content">
      <div class="summary-section">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="验证时间" width="200">
            {{ formatTime(summary.verifyTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="总通过率">
            <el-tag type="success">
              {{ formatPercent(summary.successRate) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="defect-rates mt-4">
          <h4>各缺陷类型通过率：</h4>
          <div 
            v-for="(rate, index) in summary.defectRates" 
            :key="index"
            class="rate-item"
          >
            <span class="defect-name">{{ rate.defect }}</span>
            <div class="progress-container">
              <el-progress 
                :percentage="rate.rate * 100" 
                :format="formatProgress"
                :status="getStatus(rate.rate)"
                :stroke-width="16"
              />
              <span class="rate-text">
                {{ formatPercent(rate.rate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <el-table 
        :data="details" 
        height="400px"
        style="margin-top: 20px"
        stripe
      >
        <el-table-column label="编号" width="60" align="center">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="brandName" label="品牌" align="center" />
        <el-table-column prop="defectName" label="缺陷类型" align="center" />
        <el-table-column label="结果" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 1 ? 'success' : 'danger'" size="small">
              {{ row.result === 1 ? '通过' : '未过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small"
              @click="handleView(row)"
            >
              查看图片
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  visible: Boolean,
  tableData: {
    type: Object,
    default: () => ({
      summary: {
        verifyTime: '',
        successRate: 0,
        defectRates: []
      },
      details: []
    })
  }
});

const emit = defineEmits(['update:visible', 'view']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const summary = computed(() => props.tableData.summary);
const details = computed(() => props.tableData.details);

const formatTime = (time) => {
  try {
    return new Date(time).toLocaleString();
  } catch {
    return '--';
  }
};

const formatPercent = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatProgress = (percent) => {
  return `${percent.toFixed(1)}%`;
};

const getStatus = (rate) => {
  return rate >= 0.8 ? 'success' : rate >= 0.5 ? 'warning' : 'exception';
};

// 使用箭头函数明确定义
const handleView = (row) => {
  emit('view', row);
};

// 暴露方法给模板
defineExpose({
  handleView
});
</script>

<style scoped>
.verify-dialog {
  :deep(.el-dialog__body) {
    padding: 15px 20px;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  height: 70vh;
}

.summary-section {
  padding: 10px;
  background: #f8f9fc;
  border-radius: 4px;
}

.defect-rates {
  margin-top: 15px;

  h4 {
    margin: 0 0 10px 0;
    color: #606266;
    font-size: 14px;
  }
}

.rate-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .defect-name {
    width: 120px;
    font-size: 13px;
    color: #303133;
  }

  .progress-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.el-progress) {
      flex: 1;
    }

    .rate-text {
      width: 60px;
      font-size: 13px;
      color: #409eff;
      font-weight: 500;
    }
  }
}

.el-table {
  margin-top: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>