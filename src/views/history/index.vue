<template>
    <el-card shadow="never" class="border-1">
    
    <el-divider />
    <el-table :data="tableData" height="680px">
      <el-table-column label="编号" align="center" width="60px">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="machineName" label="设备名称" align="center"/>
      <el-table-column prop="numTotal" label="总处理数量" align="center"/>
      <el-table-column prop="numRemove" label="总剔除数量" align="center"/>
      <el-table-column prop="postTime" label="上传时间" align="center"/>
      <el-table-column label="操作"  align="center">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            text
            @click="showDetails(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination
        layout="prev, pager, next, jumper"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="getData"
      />
    </div>

    <!-- 引入设备详情弹窗 -->
    <DeviceDetailDialog 
      v-model="dialogVisible"
      :device-data="selectedDevice"
      @show-detail="showDetail"
    />

    <QuantityDetailDialog 
      v-model="detailVisible" 
      :device-data="selectedDevice"
    />
    </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  fetchDeviceData, 
  getDeviceList
} from '@/apis/device'
import { ElMessage } from 'element-plus'
// 新增引入
import DeviceDetailDialog from '@/components/DeviceDetailDialog.vue'

// 新增状态管理
const dialogVisible = ref(false)
const detailVisible = ref(false)
const selectedDevice = ref(null)

// 点击事件处理
const showDetails = (row) => {
  selectedDevice.value = row
  dialogVisible.value = true
}
// const showDetail = (row) => {
//   selectedDevice.value = row
//   detailVisible.value = true
// }
const showDetail = () => {
  //selectedDevice.value = row
  detailVisible.value = true
}



// 数据列表
const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)

const getData = (p = null) => {
  if (typeof p === 'number') currentPage.value = p
  
  getDeviceList(currentPage.value, pageSize.value)
    .then(res => {
      tableData.value = res.data.data.rows
      total.value = res.data.data.total
    })
    .catch(error => {
      ElMessage.error('获取数据失败')
      console.error(error)
    })
}
getData()
</script>

<style scoped>
/* 调整跳转输入框尺寸 */
:deep(.el-pagination__jump) {
  margin-left: 10px;
  font-size: 14px;
}

:deep(.el-pagination .el-input__inner) {
  width: 50px;  /* 调整输入框宽度 */
  padding: 0 8px;
}

:deep(.el-pagination .el-input__suffix) {
  right: 2px;
}

:deep(.el-pagination__editor) {
  width: 50px;  /* 调整整个跳转编辑区宽度 */
}
</style>