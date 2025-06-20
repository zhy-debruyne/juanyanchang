<template>
  <el-card shadow="never" class="border-1">
    <el-divider />
    <el-table :data="tableData" height="680px" style="width: 100%">
      <el-table-column label="编号" align="center" width="60">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="shiftName" label="班次名称" align="center" />
      <el-table-column prop="machineID" label="设备编号" align="center" />
      <el-table-column label="总通过率" align="center">
        <template #default="{ row }">
          <el-tag type="success">
            {{ (row.successRate * 100).toFixed(1) }}%
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="verifyTime" label="验证时间" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.verifyTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small"
            text
            @click="showDetail(row)"
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
        @current-change="handlePageChange"
      />
    </div>

       <!-- 新增图片预览对话框 -->
      <el-dialog v-model="dialogVisibleimg" title="图片预览" width="60%">
          <div class="image-preview">
              <el-image :src="previewImage" :preview-src-list="[previewImage]" fit="contain"
                  style="width: 100%; height: 60vh;">
                  <template #error>
                      <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>图片加载失败</span>
                      </div>
                  </template>
              </el-image>
          </div>
      </el-dialog>

    <VerifyResultDialog 
      v-model:visible="dialogVisible"
      :table-data="detailData"
      @view="handleViewImage"
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVerifyList, getVerifyDetail } from '@/apis/verify'
import { ElMessage } from 'element-plus'

// 表格数据相关
const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)

// 图片预览相关
const dialogVisibleimg = ref(false);
const previewImage = ref('');

// 详情对话框相关
const dialogVisible = ref(false)
const detailData = ref({
  summary: {
    verifyTime: '',
    successRate: 0,
    defectRates: []
  },
  details: []
})

// 时间格式化
const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取验证记录列表
const fetchData = async () => {
  try {
    const res = await getVerifyList(currentPage.value, pageSize.value)
    if (res.data.code === 1) {
      tableData.value = res.data.data.rows.map(item => ({
        ...item,
        verifyTime: formatDateTime(item.verifyTime)
      }))
      total.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

// 显示验证详情
const showDetail = async (row) => {
  try {
    const res = await getVerifyDetail(row.id)
    if (res.data.code === 1) {
      detailData.value = {
        summary: {
          verifyTime: row.verifyTime,
          successRate: row.successRate,
          defectRates: calculateDefectRates(res.data.data)
        },
        details: res.data.data.map(item => ({
          fileName: item.fileName,
          result: item.verifyResult,
          fullPath: `C:/project/dataset/重新分类/${item.fileName}`,
          brandName: item.brandName || '未知品牌',
          defectName: item.defectName || '未知缺陷'
        }))
      }
      dialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 计算缺陷通过率
const calculateDefectRates = (data) => {
  const defectStats = new Map()
  data.forEach(item => {
    const defect = item.defectName || '未知缺陷'
    if (!defectStats.has(defect)) {
      defectStats.set(defect, { total: 0, pass: 0 })
    }
    const stat = defectStats.get(defect)
    stat.total++
    if (item.verifyResult === 1) stat.pass++
  })
  return Array.from(defectStats).map(([defect, stat]) => ({
    defect,
    rate: stat.total > 0 ? stat.pass / stat.total : 0
  }))
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleViewImage = (row) => {
  if (row.fullPath) {
    //console.log(row.fullPath);
    previewImage.value = `/api/file/preview?path=${encodeURIComponent(row.fullPath)}`;
    dialogVisibleimg.value = true;
  } else {
    ElMessage.warning('该记录暂无原图');
  }
};

// 初始化加载数据
onMounted(fetchData)



</script>

<style scoped>
/* 保持分页样式统一 */
:deep(.el-pagination__jump) {
  margin-left: 10px;
  font-size: 14px;
}

:deep(.el-pagination .el-input__inner) {
  width: 50px;
  padding: 0 8px;
}

:deep(.el-pagination__editor) {
  width: 50px;
}

.el-tag {
  width: 80px;
  justify-content: center;
}
</style>