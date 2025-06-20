<template>
  <el-dialog
    title="设备详情"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="800px"
    class="monitor-dialog"
  >
    <!-- 设备基础信息 -->
    <el-row :gutter="10" class="info-row">
      <el-col :span="8">
        <div class="info-item">
          <label>设备编号：</label>
          <span>{{ deviceData?.machineID || '-' }}</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="info-item">
          <label>上报时间：</label>
          <span>{{ deviceData?.postTime || '-' }}</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="info-item">
          <label>IP地址:</label>
          <span>{{ deviceData?.ipaddress || '-' }}</span>
        </div>
      </el-col>
    </el-row>

    <!-- 主要信息展示 -->
    <el-row :gutter="10" class="main-content">
      <!-- 相机温度 -->
      <el-col :span="12">
        <div class="section compact-section">
          <h3 class="section-title"><el-icon><Monitor /></el-icon> 相机温度</h3>
          <div class="temperature-list">
            <div 
              v-for="(_, index) in 4"
              :key="index"
              class="temperature-item compact-item"
            >
              <span class="camera-label">相机{{ index }}：</span>
              <span class="temperature-value">{{ formatTemperature(deviceData?.[`camera${index}`]) }}℃</span>
              <el-icon v-if="(deviceData?.[`camera${index}`] || 0) > 50" color="#FF9900"><Warning /></el-icon>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧状态区 -->
      <el-col :span="12">
        <el-row :gutter="10" class="status-section">
          <el-col :span="12">
            <!-- <div class="section compact-section status-box">
              <h3 class="section-title">
                <el-icon><Operation /></el-icon>
                运行状态
              </h3>
              <StatusIndicator :status="operationStatus.type" :label="operationStatus.label" />
            </div> -->
            <div class="section compact-section quantity-box">
               <h3 class="section-title"><el-icon><DataLine /></el-icon> 生产统计</h3>
                 <div class="quantity-status">
                  <p>总处理数量：{{ deviceData?.numTotal || 0 }}</p>
                  <p>总剔除数量：{{ deviceData?.numRemove || 0 }}</p>
                  <el-link 
                   type="primary" 
                   class="compact-link" 
                   @click="$emit('show-detail')"
                   >
                  查看详情
                 </el-link>
               </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="section compact-section speed-box">
              <h3 class="section-title">
                <el-icon><Histogram /></el-icon>
                运行速度
              </h3>
              <div class="speed-display">
                <el-statistic 
                  :value="deviceData?.machineSpeed || 0" 
                  :precision="1" 
                  suffix=" " 
                />
                <el-progress 
                  :percentage="speedPercentage"
                  :color="speedColor"
                  :stroke-width="12"
                  striped
                />
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 生产统计 -->
        <!-- <div class="section compact-section quantity-box">
          <h3 class="section-title"><el-icon><DataLine /></el-icon> 生产统计</h3>
          <div class="quantity-status">
            <p>总处理数量：{{ deviceData?.numTotal || 0 }}</p>
            <p>总剔除数量：{{ deviceData?.numRemove || 0 }}</p>
            <el-link 
              type="primary" 
              class="compact-link" 
              @click="$emit('show-detail')"
            >
              查看详情
            </el-link>
          </div>
        </div> -->
      </el-col>
    </el-row>


    <!-- 运行状态 -->
    <el-row :gutter="10" class="status-section">
    <el-col  :span="12">
    <div class="section compact-section">
       <h3 class="section-title">
        <el-icon><Operation /></el-icon> 运行状态</h3>
        <div class="system-messages">
          <div>
            当前状态：{{ deviceStatus || '-' }}
          </div>
        </div>
     <!-- <StatusIndicator :status="operationStatus.type" :label="operationStatus.label" /> -->
    </div>
    </el-col>

    <!-- 设备状态 -->
    <el-col  :span="12">
    <div class="section compact-section">
      <h3 class="section-title"><el-icon><Message /></el-icon> 设备状态</h3>
      <div class="system-messages">
        <div>
          当前状态：{{ errorStatus || '-' }}
        </div>
      </div>
    </div>
    </el-col>
    </el-row>
    

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Monitor,
  Warning,
  DataLine,
  Message,
  Operation,
  Histogram
} from '@element-plus/icons-vue'
import StatusIndicator from '@/components/StatusIndicator.vue'

const props = defineProps({
  modelValue: Boolean,
  deviceData: Object
})

// 运行状态映射表
const removeStatusMap = {
  0: '关闭所有阀',
  1: '开启剔除',
  2: '开启取样',
  3: '开启所有阀'
}

// 错误码映射表(根据图片信息更新)
const errorCodeMap = {
  '0xD001': '图像处理程序未运行',
  '0xD002': '同步脉冲程序未运行',
  '0xD010': '相机0未初始化',
  '0xD011': '相机1未初始化',
  '0xD012': '相机2未初始化',
  '0xD013': '相机3未初始化',
  '0xD014': '检测轮镜头0污染',
  '0xD015': '检测轮镜头1污染',
  '0xD016': '检测轮镜头2污染',
  '0xD017': '检测轮镜头3污染',
  '0xD018': '检测轮相机0乱烟',
  '0xD019': '检测轮相机1乱烟',
  '0xD01A': '检测轮相机2乱烟',
  '0xD01B': '检测轮相机3乱烟',
  '0xD020': '连续剔除超限',
  '0xD021': '检测轮槽周期性污染',
  '0xD022': '剔除轮槽周期性污染',
  '0xD024': '连续剔除',
  '0xD025': '检测轮检测持续出现异常图片',
  '0xD026': '剔废轮检测持续出现异常图片'
}

// 设备状态计算
const errorStatus = computed(() => {
  const code = props.deviceData?.errNo
  return errorCodeMap[code] || `未知错误码：${code}`
})

// 运行状态计算
const deviceStatus = computed(() => {
  const status = props.deviceData?.removeStatus
  return removeStatusMap[status] || `未知状态码：${status}`
})




const speedPercentage = computed(() => 
  Math.min(props.deviceData?.machineSpeed || 0, 100)
)

const speedColor = computed(() => {
  const speed = props.deviceData?.machineSpeed || 0
  return speed > 80 ? '#FF3300' : speed > 50 ? '#FF9900' : '#409EFF'
})




// 温度格式化
const formatTemperature = (value) => {
  return value !== null && value !== undefined ? value : '-'
}
</script>

<style scoped>
.monitor-dialog {
  font-family: Arial, sans-serif;
}

.info-row {
  margin-bottom: 12px;
}

.info-item {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.section {
  margin: 12px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.section-title {
  color: #409EFF;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.temperature-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 4px 0;
  background: white;
  border-radius: 4px;
}

.temperature-value {
  color: #FF9900;
  font-weight: bold;
  margin: 0 8px;
}

.status-section {
  margin-bottom: 0;
}

.speed-display {
  padding: 8px 0;
}

.el-progress {
  margin-top: 8px;
}

.el-statistic {
  font-size: 20px;
  color: #409EFF;
}

.quantity-status {
  padding: 8px;
}

.system-messages {
  background: white;
  padding: 8px;
  border-radius: 4px;
}

.message-item {
  padding: 3px 0;
  display: flex;
  align-items: center;
  font-size: 13px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #67C23A;
  border-radius: 50%;
  margin-right: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
}
</style>