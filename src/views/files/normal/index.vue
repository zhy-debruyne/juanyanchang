<template>
  <el-card shadow="never" class="border-1">
    <div>
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <!-- 设备编号多选下拉 -->
        <el-form-item label="设备编号">
          <el-select
            v-model="form.machineIDs"
            multiple
            filterable
            collapse-tags
            placeholder="请选择设备"
            style="width: 200px"
          >
            <el-option
              v-for="item in machineOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <!-- 品牌名称多选下拉 -->
        <el-form-item label="品牌名称">
          <el-select
            v-model="form.brands"
            multiple
            filterable
            collapse-tags
            placeholder="请选择品牌"
            style="width: 200px"
          >
            <el-option
              v-for="item in brandOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <!-- 时间范围选择 -->
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :default-time="defaultTime"
            :shortcuts="shortcuts" 
            style="width: 480px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery" class="mr-4" plain>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-divider />
    <el-table :data="tableData" height="600px">
      <el-table-column label="编号" align="center" width="60px">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="machineID" label="设备编号" align="center" />
      <el-table-column prop="brandName" label="品牌名称" align="center"/>
      <el-table-column prop="postTime" label="上传时间" align="center" />
      <el-table-column label="操作"  align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handlePreview(scope.row)">查看图片</el-button>
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

    <el-dialog v-model="dialogVisible" title="图片预览" width="60%">
      <div class="image-preview">
        <el-image 
          :src="previewImage" 
          :preview-src-list="[previewImage]"
          fit="contain" 
          style="width: 100%; height: 60vh;"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { getSamplenList, getallnamesn } from '@/apis/sample';
import { Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)
const dialogVisible = ref(false)
const previewImage = ref('')

// 筛选相关
const machineOptions = ref([])
const brandOptions = ref([])
const form = reactive({
  machineIDs: [],
  brands: [],
  timeRange: []
})

// 时间处理
const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 1, 1, 23, 59, 59)
]
// 日期格式转换工具函数
const formatDate = (date) => {
  if (!date) return ''
  
  const pad = (n) => n.toString().padStart(2, '0')
  
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1), // 月份从0开始
    pad(date.getDate()),
  ].join('-') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':')
}
// 时间快捷选项
const shortcuts = [
  {
    text: '最近一天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 初始化获取筛选选项
onMounted(async () => {
  try {
    const { data } = await getallnamesn()
    machineOptions.value = data.machineIDs || []
    brandOptions.value = data.brandNames || []
    getData()
  } catch (error) {
    ElMessage.error('获取筛选选项失败')
  }
})

// 获取数据
const getData = (p = null) => {
  if (typeof p === 'number') currentPage.value = p
  
  // 处理时间参数
  let [start, end] = form.timeRange || []

  start = formatDate(start)
  end = formatDate(end)
  
  if (!form.timeRange) {
    start = undefined
    end = undefined
  }

  getSamplenList(
    currentPage.value,
    pageSize.value,
    form.machineIDs,
    form.brands,
    start,
    end
  ).then(res => {
    if (res.data.code === 1) {
      tableData.value = res.data.data.rows
      total.value = res.data.data.total
    }
  }).catch(() => ElMessage.error('数据加载失败'))
}

// 查询处理
const handleQuery = () => {
  currentPage.value = 1
  getData()
}

// 图片预览
const handlePreview = (row) => {
  if (!row.fileName) return ElMessage.warning('无可用图片')
  previewImage.value = `/api/file/preview?path=${encodeURIComponent(row.fileName)}`
  dialogVisible.value = true
}
</script>

<style scoped>
.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--el-text-color-secondary);
  
  .el-icon {
    font-size: 40px;
    margin-bottom: 10px;
  }
}

:deep(.el-pagination__jump) {
  margin-left: 10px;
  font-size: 14px;
}

:deep(.el-pagination .el-input__inner) {
  width: 50px;
  padding: 0 8px;
}

:deep(.el-pagination .el-input__suffix) {
  right: 2px;
}

:deep(.el-pagination__editor) {
  width: 50px;
}
</style>