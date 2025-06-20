<template>
  <el-dialog
    title="数量详情"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="980px"
    class="data-dashboard"
  >
    <div class="detail-content">
      <el-row :gutter="24">
        <!-- 左侧紧凑型数据表格 -->
        <el-col :span="7">
          <el-space direction="vertical" :size="18" fill>
            <!-- 检测轮数据 -->
            <div class="data-block">
              <h3 class="section-title">检测轮数据</h3>
              <el-table
                :data="detectionWheelData"
                size="small"
                class="compact-table"
                max-height="320px"
                :scrollbar-always-on="true"
              >
                <el-table-column 
                  prop="name" 
                  label="检测项" 
                  width="112"
                  show-overflow-tooltip
                />
                <el-table-column 
                  prop="value" 
                  label="数值" 
                  width="90"
                  align="center"
                  :formatter="valueFormatter"
                />
              </el-table>
            </div>

            <!-- 剔废轮数据 -->
            <div class="data-block">
              <h3 class="section-title">剔废轮数据</h3>
              <el-table
                :data="rejectWheelData"
                size="small"
                class="compact-table"
                max-height="260px"
                :scrollbar-always-on="true"
              >
                <el-table-column 
                  prop="name" 
                  label="检测项" 
                  width="112"
                  show-overflow-tooltip
                />
                <el-table-column 
                  prop="value" 
                  label="数量" 
                  width="90"
                  align="center"
                  :formatter="valueFormatter"
                />
              </el-table>
            </div>
          </el-space>
        </el-col>

        <!-- 右侧增强饼图 -->
        <el-col :span="17">
          <div class="enhanced-chart">
            <div 
              v-if="hasChartData"
              ref="chartRef" 
              class="pie-chart"
              style="width: 100%;height:560px"
            ></div>
            <el-empty 
              v-else 
              description="暂无数据" 
              :image-style="{ height: '120px' }"
            />
          </div>
        </el-col>
      </el-row>

      <!-- 底部统计 -->
      <div class="enhanced-stats">
        <el-statistic
          title="总处理数量"
          :value="deviceData?.numTotal || 0"
          :value-style="{
            fontSize: '20px',
            color: '#409EFF',
            fontWeight: 600
          }"
        />
        <el-statistic
          title="总剔除数量"
          :value="deviceData?.numRemove || 0"
          :value-style="{
            fontSize: '20px',
            color: '#F56C6C',
            fontWeight: 600
          }"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElEmpty } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  deviceData: Object
})

const chartRef = ref(null)
let chartInstance = null

// 数据格式化
const valueFormatter = (row, column, value) => {
  return value === 0 ? '0' : value || '-'
}

// 检测轮数据
const detectionWheelData = computed(() => [
  { name: '卷烟黑点', value: props.deviceData?.jianchelunJuanyanHeidian || 0 },
  { name: '卷烟白点', value: props.deviceData?.jianchelunJuanyanBaidian || 0 },
  { name: '卷烟区域瑕疵', value: props.deviceData?.jianchelunJuanyanXiachi || 0 },
  { name: '水松纸黑点', value: props.deviceData?.jianchelunShuisongHeidian || 0 },
  { name: '水松纸白点', value: props.deviceData?.jianchelunShuisongBaidian || 0 },
  { name: '水松纸褶皱瑕疵', value: props.deviceData?.jianchelunShuisongXiachi || 0 },
  { name: '错牙', value: props.deviceData?.jianchelunCuoya || 0 },
  { name: '烟支定位', value: props.deviceData?.jianchelunDingwei || 0 },
  { name: '烟支长度', value: props.deviceData?.yanzhiChangdu || 0 },
  { name: '水松纸长度', value: props.deviceData?.shuisongzhiChangdu || 0 }
])

// 剔废轮数据
const rejectWheelData = computed(() => [
  { name: '卷烟黑点', value: props.deviceData?.tifeilunJuanyanHeidian || 0 },
  { name: '卷烟白点', value: props.deviceData?.tifeilunJuanyanBaidian || 0 },
  { name: '卷烟区域瑕疵', value: props.deviceData?.tifeilunJuanyanXiachi || 0 },
  { name: '水松纸黑点', value: props.deviceData?.tifeilunShuisongHeidian || 0 },
  { name: '水松纸白点', value: props.deviceData?.tifeilunShuisongBaidian || 0 },
  { name: '水松纸褶皱瑕疵', value: props.deviceData?.tifeilunShuisongXiachi || 0 },
  { name: '错牙', value: props.deviceData?.tifeilunCuoya || 0 },
  { name: '烟支定位', value: props.deviceData?.tifeilunDingwei || 0 }
])

const hasChartData = computed(() => {
  return detectionWheelData.value.some(item => item.value > 0) ||
         rejectWheelData.value.some(item => item.value > 0)
})

// ECharts配置
const initChart = () => {
  if (!chartRef.value) return
  
  const colors = [
    '#5470C6', '#91CC75', '#FAC858', '#EE6666',
    '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
    '#EA7CCC', '#60C0DD'
  ]

  const option = {
    title: {
      text: '缺陷分布分析',
      left: 'center',
      top: 12,
      textStyle: {
        fontSize: 16,
        color: '#303133',
        fontWeight: 500
      }
    },
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c} ({d}%)',
      textStyle: {
        fontSize: 12
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 24,
      itemGap: 12,
      itemWidth: 14,
      itemHeight: 8,
      pageIconColor: '#409EFF',
      pageTextStyle: {
        color: '#909399'
      },
      textStyle: {
        fontSize: 12,
        color: '#606266'
      },
      data: [
        ...detectionWheelData.value.map(d => d.name),
        ...rejectWheelData.value.map(d => d.name)
      ]
    },
    series: [
      {
        name: '检测轮缺陷',
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '48%'],
        data: detectionWheelData.value,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        }
      },
      {
        name: '剔除轮缺陷',
        type: 'pie',
        radius: ['28%', '42%'],
        center: ['50%', '48%'],
        data: rejectWheelData.value,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        }
      }
    ]
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.deviceData, () => {
  nextTick(() => initChart())
})

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

const handleResize = () => {
  chartInstance?.resize()
}

watch(() => props.modelValue, (val) => {
  if (val && hasChartData.value) {
    nextTick(() => initChart())
  }
})
</script>

<style scoped>
.detail-content {
  padding: 18px 24px;
}

.section-title {
  font-size: 14px;
  color: #303133;
  margin: 0 0 12px 8px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

/* 紧凑表格 */
.compact-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  
  :deep(.el-table__header th) {
    padding: 6px 0;
    background: #f5f7fa;
  }
  
  :deep(.el-table__cell) {
    padding: 4px 0;
    font-size: 12px;
  }
}

/* 增强图表容器 */
.enhanced-chart {
  height: 580px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  
  :deep(.el-empty__description) {
    margin-top: -40px;
    color: #909399;
  }
}

/* 统计面板 */
.enhanced-stats {
  margin-top: 24px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  :deep(.el-statistic__title) {
    margin-bottom: 6px;
    font-size: 13px;
    color: #606266;
  }
}

.data-block + .data-block {
  margin-top: 18px;
}
</style>