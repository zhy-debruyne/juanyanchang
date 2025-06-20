<template>
    <div class="status-indicator">
      <el-icon :color="status.color" :size="26">
        <component :is="status.icon" />
      </el-icon>
      <div class="status-text">
        <p class="status-label">{{ status.label }}</p>
        <p class="status-desc">{{ status.description }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    status: {
      type: Object,
      required: true
    }
  })
  </script>
  
  <style scoped>
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
  }
  
  .status-text {
    line-height: 1.4;
  }
  
  .status-label {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 2px;
  }
  
  .status-desc {
    color: #909399;
    font-size: 12px;
    line-height: 1.3;
  }
  </style>