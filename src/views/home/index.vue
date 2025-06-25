<template>
  <div>
    <el-card shadow="never" class="border-1">
      <el-container>
        <el-header class="page-header">点击对应设备进入设备详情</el-header>
        <el-container>
          <el-main>
            <div class="image-container" ref="backgroundContainer">
              <div class="button-layer">
                <!-- 车间通道分割线 -->
                <div class="divider-line top"></div>
                <div class="divider-line bottom"></div>
                <div class="passage-label">车间通道</div>
                
                <!-- 设备按钮（修改为图片形式） -->
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
                  <img 
                    :src="getStatusImage(pos.device.machineID, index)" 
                    class="device-image"
                    :alt="'设备'+pos.device.machineID"
                  >
                  <span class="device-badge">{{ pos.device.machineID }}</span>
                </div>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
      <!-- 状态说明（保持左下角颜色不变） -->
      <div class="status-legend">
        <div v-for="status in statusList" :key="status.type" class="status-item">
          <div class="color-block" :style="{backgroundColor: status.color}"></div>
          <span class="status-text">{{ status.label }}</span>
        </div>
      </div>
    </el-card>
    <!-- 保留原有对话框 -->
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
import axios from '@/axios'
import DeviceDetailDialog from '@/components/DeviceDetailDialog.vue'
import QuantityDetailDialog from '@/components/QuantityDetailDialog.vue'
// 状态说明颜色保持不变（与左下角一致）
const statusList = ref([
  { type: 'running', label: '运行', color: '#1FC121' },
  { type: 'stopped', label: '停机', color: '#F11818' },
  { type: 'offline', label: '断网/断电', color: '#C4C4C4' }
])
// 图片路径（修改按钮为图片形式）
const runningImg = new URL('@/views/home/img/1.png', import.meta.url).href;
const stoppedImg = new URL('@/views/home/img/2.png', import.meta.url).href;
const offlineImg = new URL('@/views/home/img/3.png', import.meta.url).href;
const runningImgBottom = new URL('@/views/home/img/4.png', import.meta.url).href;
const stoppedImgBottom = new URL('@/views/home/img/5.png', import.meta.url).href;
const offlineImgBottom = new URL('@/views/home/img/6.png', import.meta.url).href;
// 其余变量声明
const dialogVisible = ref(false)
const detailVisible = ref(false)
const devices = ref([])
const currentDevice = ref(null)
const backgroundContainer = ref(null)
let intervalId = null
// 原始设备坐标
const originalImageWidth = 1446
const originalImageHeight = 769
const originalPositions = [
  { x: 50, y: 140, device: { machineID: "1"} },
  { x: 200, y: 140, device: { machineID: "2"} },
  { x: 350, y: 140, device: { machineID: "3"} },
  { x: 500, y: 140, device: { machineID: "4"} },
  { x: 650, y: 140, device: { machineID: "5"} },
  { x: 800, y: 140, device: { machineID: "6"} },
  { x: 950, y: 140, device: { machineID: "7"} },
  { x: 1100, y: 140, device: { machineID: "8"} },
  { x: 1250, y: 140, device: { machineID: "9"} },
  { x: 1400, y: 140, device: { machineID: "10"} },
  { x: 50, y: 600, device: { machineID: "11"} },
  { x: 200, y: 600, device: { machineID: "12"} },
  { x: 350, y: 600, device: { machineID: "13"} },
  { x: 500, y: 600, device: { machineID: "14"} },
  { x: 650, y: 600, device: { machineID: "15"} },
  { x: 800, y: 600, device: { machineID: "16"} },
  { x: 950, y: 600, device: { machineID: "17"} },
  { x: 1100, y: 600, device: { machineID: "18"} },
  { x: 1250, y: 600, device: { machineID: "19"} },
  { x: 1400, y: 600, device: { machineID: "20"} },
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
// 获取状态图片（修改按钮为图片）
const getStatusImage = (machineID, index) => {
  const device = devices.value.find(d => d.machineID === machineID.toString())
  if (!device) return index < 10 ? offlineImg : offlineImgBottom
  
  if (device.isConnected === 0) {
    return index < 10 ? offlineImg : offlineImgBottom  // 断网/断电
  } else if (device.machineSpeed === 0) {
    return index < 10 ? stoppedImg : stoppedImgBottom  // 停机
  } else {
    return index < 10 ? runningImg : runningImgBottom  // 运行
  }
}
// 获取设备数据
const fetchData = async () => {
  try {
    const response = await axios.get('/device/data')
    if (response.data && response.data.data) {
      devices.value = response.data.data.map(device => {
        return {
          ...device,
          machineID: device.machineID.toString(),
          isConnected: device.isConnected || 0,
          machineSpeed: device.machineSpeed || 0
        }
      })
    }
  } catch (error) {
    console.error('获取设备数据失败:', error)
  }
}
// 设备点击处理
const handleDeviceClick = (device) => {
  const deviceID = device.machineID
  const foundDevice = devices.value.find(d => d.machineID === deviceID.toString())
  if (foundDevice) {
    currentDevice.value = foundDevice
    dialogVisible.value = true
  } else {
    console.warn(`未找到设备 ${deviceID} 的详细信息`)
  }
}
// 显示详情
const showDetail = () => {
  dialogVisible.value = false
  detailVisible.value = true
}
// 生命周期钩子
onMounted(async () => {
  await fetchData()
  calculatePositions()
  window.addEventListener('resize', calculatePositions)
  
  intervalId = setInterval(async () => {
    await fetchData()
  }, 5000)
})
onUnmounted(() => {
  window.removeEventListener('resize', calculatePositions)
  if (intervalId) clearInterval(intervalId)
})
</script>
<style scoped>
/* 页面顶部标题 */
.page-header {
  color: #999;
  font-size: 18px; /* 增大标题字体 */
  height: auto;
  padding: 10px 20px;
  text-align: center;
  border-bottom: none;
}
/* 容器样式 - 去除背景图，设置为白色背景 */
.image-container {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 600px;
  background-color: white; /* 白色背景 */
}
.button-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
/* 设备按钮样式（图片形式） */
.icon-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  padding: 12px; /* 增大内边距 */
  transition: all 0.3s ease;
  pointer-events: auto;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-wrapper:hover {
  transform: translate(-50%, -50%) scale(1.2); /* 增大悬停缩放比例 */
  filter: drop-shadow(0 0 8px rgba(92, 184, 122, 0.3));
}
.device-image {
  width: 100px; /* 增大图片尺寸 */
  height: 150px; /* 增大图片尺寸 */
  display: block;
  margin-bottom: 8px; /* 增大图片与编号的间距 */
}
.device-badge {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px; /* 增大徽章内边距 */
  border-radius: 12px;
  font-size: 14px; /* 增大设备编号字体 */
  white-space: nowrap;
}
/* 车间通道分割线（新增） */
.divider-line {
  position: absolute;
  left: 5%;
  width: 90%;
  height: 1px;
  background-color: #cccccc; /* 浅灰色 */
  z-index: 10;
}
.divider-line.top {
  top: 45%; /* 向上移动顶部分割线 */
}
.divider-line.bottom {
  top: 55%; /* 向下移动底部分割线，间距从20%缩小到10% */
}
.passage-label {
  position: absolute;
  top: 50%; /* 保持在中间 */
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white; /* 白色背景 */
  padding: 2px 15px;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  z-index: 15;
  border: 1px solid #eee; /* 细边框 */
}
/* 状态说明（左下角保持不变） */
.status-legend {
  position: fixed;
  left: 250px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  gap: 15px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.color-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.status-text {
  font-size: 14px;
  color: #606266;
}
/* 移除不必要的边距和边框 */
.el-container {
  margin: 0;
  padding: 0;
}
.el-main {
  padding: 0;
  margin: 0;
}
.el-card {
  border: none;
}
</style>