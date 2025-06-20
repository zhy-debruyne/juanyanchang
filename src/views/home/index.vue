<template>
  <div>
    <el-card shadow="never" class="border-1">
      <el-container>
        <el-header>点击对应设备进入设备详情</el-header>
        <el-container>
          <el-main>
            <div class="image-container" ref="backgroundContainer">
              <div class="button-layer">
                <div 
                  v-for="(pos, index) in buttonPositions"
                  :key="index"
                  class="icon-wrapper"
                  :style="{ 
                    top: pos.top, 
                    left: pos.left
                  }"
                  @click="handleDeviceClick(pos.device)"
                >
                  <el-icon :size="40" :color="getStatusColor(pos.device.machineID)">
                    <Monitor />
                  </el-icon>
                  <span class="device-badge">{{ pos.device.machineID }}</span>
                </div>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>

      <!-- 状态说明 -->
      <div class="status-legend">
        <div v-for="status in statusList" :key="status.type" class="status-item">
          <div class="color-block" :style="{backgroundColor: status.color}"></div>
          <span class="status-text">{{ status.label }}</span>
        </div>
      </div>
    </el-card>

    <DeviceDetailDialog 
      v-model="dialogVisible"
      :device-data="currentDevice"
      @show-detail="showDetail"
    />

    <QuantityDetailDialog 
      v-model="detailVisible" 
      :device-data="currentDevice"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import axios from '@/axios'
import DeviceDetailDialog from '@/components/DeviceDetailDialog.vue'
import QuantityDetailDialog from '@/components/QuantityDetailDialog.vue'

const dialogVisible = ref(false)
const detailVisible = ref(false)
const devices = ref([])
const currentDevice = ref(null)
const backgroundContainer = ref(null)
let intervalId = null

// 原始设备坐标（根据实际图片中的位置填写）
const originalImageWidth = 1446  // 替换为实际图片宽度
const originalImageHeight = 769 // 替换为实际图片高度
const originalPositions = [
  { x: 40, y: 140, device: { machineID: "1"} },
  { x: 240, y: 140, device: { machineID: "2"} },
  { x: 480, y: 140, device: { machineID: "3"} },
  { x: 720, y: 140, device: { machineID: "4"} },
  { x: 960, y: 140, device: { machineID: "5"} },
  { x: 1200, y: 140, device: { machineID: "6"} },
  { x: 40, y: 540, device: { machineID: "7"} },
  { x: 240, y: 540, device: { machineID: "8"} },
  { x: 480, y: 540, device: { machineID: "9"} },
  { x: 720, y: 540, device: { machineID: "10"} },
  { x: 960, y: 540, device: { machineID: "11"} },
  { x: 1200, y: 540, device: { machineID: "12"} },
]

const buttonPositions = ref([])

// 动态计算位置
const calculatePositions = () => {
  if (!backgroundContainer.value) return
  
  const container = backgroundContainer.value
  const rect = container.getBoundingClientRect()
  const containerWidth = rect.width
  const containerHeight = rect.height
  
  // 计算缩放比例
  const widthRatio = containerWidth / originalImageWidth
  const heightRatio = containerHeight / originalImageHeight
  const ratio = Math.min(widthRatio, heightRatio)
  
  // 计算图片在容器中的实际显示区域
  const imageWidth = originalImageWidth * ratio
  const imageHeight = originalImageHeight * ratio
  const offsetX = (containerWidth - imageWidth) / 2
  const offsetY = (containerHeight - imageHeight) / 2

  // 转换坐标
  buttonPositions.value = originalPositions.map(pos => ({
    top: `${offsetY + pos.y * ratio}px`,
    left: `${offsetX + pos.x * ratio}px`,
    device: pos.device
  }))
}

// 状态颜色计算
const getStatusColor = (machineID) => {
  const device = devices.value.find(d => d.machineID === machineID.toString())
  if (!device) return '#C4C4C4'
  
  if (device.isConnected === 0) {
    return '#C4C4C4'  // 断网/断电
  } else if (device.machineSpeed === 0) {
    return '#F11818'  // 停机
  } else {
    return '#1FC121'  // 运行
  }
}

// 获取设备数据
const fetchData = async () => {
  try {
    const res = await axios.get('/device/data')
    if (res.data.code === 1) {
      // 更新设备列表
      const updatedDevices = res.data.data.map(device => ({
        ...device,
        machineID: device.machineID.toString(),
        postTime: new Date(device.postTime).toLocaleString()
      }))
      
      devices.value = updatedDevices
      
      // 如果当前设备存在且弹窗打开，更新当前设备数据
      if (currentDevice.value && (dialogVisible.value || detailVisible.value)) {
        const updatedDevice = updatedDevices.find(
          d => d.machineID === currentDevice.value.machineID
        )
        
        if (updatedDevice) {
          // 保留原始设备信息（如ip地址）
          currentDevice.value = { 
            ...currentDevice.value,
            ...updatedDevice
          }
        }
      }
    }
  } catch (error) {
    console.error('获取设备数据失败:', error)
  }
}

// 设备点击处理
const handleDeviceClick = (deviceInfo) => {
  const deviceData = devices.value.find(d => d.machineID === deviceInfo.machineID)
  currentDevice.value = { 
    ...deviceInfo, 
    ...deviceData,
    ip: deviceInfo.ip 
  }
  dialogVisible.value = true
}

// 状态说明
const statusList = ref([
  { type: 'running', label: '运行', color: '#1FC121' },
  { type: 'stopped', label: '停机', color: '#F11818' },
  { type: 'offline', label: '断网/断电', color: '#C4C4C4' }
])

onMounted(async () => {
  await fetchData()
  calculatePositions()
  window.addEventListener('resize', calculatePositions)
  
  // 始终执行定时刷新，无论弹窗状态
  intervalId = setInterval(async () => {
    await fetchData()
  }, 5000)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculatePositions)
  if (intervalId) clearInterval(intervalId)
})

const showDetail = () => {
  detailVisible.value = true
}
</script>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 600px;
  background: url('/src/views/home/img/主页背景图.png') no-repeat center / contain;
}

.button-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.icon-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.icon-wrapper:hover {
  transform: translate(-50%, -50%) scale(1.15);
  filter: drop-shadow(0 0 8px rgba(92, 184, 122, 0.3));
}

.device-badge {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}

.status-legend {
  position: fixed;
  left: 270px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.status-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.color-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
}

.status-text {
  font-size: 14px;
  color: #606266;
}
</style>