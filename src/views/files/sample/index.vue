<template>
  <el-card shadow="never" class="border-1">
      <div>
          <el-form :inline="true" :model="form" class="demo-form-inline">
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
              <!-- 缺陷类型多选下拉 -->
              <el-form-item label="缺陷类型">
                <el-select
                  v-model="form.defects"
                  multiple
                  filterable
                  collapse-tags
                  placeholder="请选择缺陷"
                  style="width: 200px"
                >
                  <el-option
                    v-for="item in defectOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <!-- 缺陷等级多选下拉 -->
              <el-form-item label="缺陷等级">
                <el-select
                  v-model="form.grades"
                  multiple
                  collapse-tags
                  placeholder="请选择等级"
                  style="width: 200px"
                >
                  <el-option
                    v-for="item in gradeOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuery" class="mr-4" plain>
                  查询
                </el-button>
                <el-button 
                  type="primary" 
                  @click="handleVerify" 
                  :loading="isVerifying"
                 class="mr-4">下发 </el-button>
                  <PublishDialog ref="publishDialog" />
                  <!-- <el-button type="primary" class="mr-4">查看验证效果</el-button> -->
              </el-form-item>
          </el-form>
      </div>
      <el-divider />
      <el-table :data="tableData" height="630px">
          <el-table-column label="编号" align="center" width="60px">
              <template #default="scope">
                  {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
              </template>
          </el-table-column>
          <el-table-column prop="brandName" label="品牌名称" align="center" />
          <el-table-column prop="defectName" label="缺陷类型" align="center" />
          <el-table-column prop="defectGrade" label="缺陷等级" align="center" />
          <el-table-column label="操作" align="center">
              <template #default="scope">
                  <el-button type="primary" size="small" text @click="handlePreview(scope.row)">查看图片</el-button>
                  <el-popconfirm title="您确定要删除吗?" confirm-button-text="确定" cancel-button-text="取消"
                      @confirm="handleDelete(scope.row.sampleID)" :disabled="!isAdmin">
                      <template #reference>
                          <el-button type="danger" size="small" text :disabled="!isAdmin">删除</el-button>
                      </template>
                  </el-popconfirm>
              </template>
          </el-table-column>
      </el-table>
      <div class="flex items-center justify-center mt-5">
          <!-- <el-pagination layout="prev, pager, next" :total="total" :current-page="currentPage"
              :page-size="pageSize" @current-change="getData" /> -->
              <el-pagination
                  layout="prev, pager, next, jumper"
                  :total="total"
                  :current-page="currentPage"
                  :page-size="pageSize"
                  @current-change="getData"
                />
      </div>
      <!-- 新增图片预览对话框 -->
      <el-dialog v-model="dialogVisible" title="图片预览" width="60%">
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

        <!-- 新增验证结果对话框组件 -->
        <VerifyResultDialog 
          v-model:visible="verifyDialogVisible"
          :table-data="verifyTableData"
          @view="handleViewImage"
        />
  </el-card>
</template>

<script setup>
import { reactive, ref , computed, onMounted, onBeforeUnmount } from 'vue';
import { getSampleList, getSamplebList, deleteSample,getallnames } from '@/apis/sample';
import { Picture } from '@element-plus/icons-vue';
import PublishDialog from '../compoments/PublishDialog.vue';
import { ElMessage } from 'element-plus';
import axios from '@/axios';
import VerifyResultDialog from '@/components/VerifyResultDialog.vue';
import { getAllMachineIsConnected } from '@/apis/machine'; // 新增导入

// 管理员状态管理
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')

// 监听storage变化
const checkAdminStatus = () => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
}

onMounted(() => {
  window.addEventListener('storage', checkAdminStatus)
  fetchOptions()
  getData()
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', checkAdminStatus)
})


// 选项数据
const brandOptions = ref([])
const defectOptions = ref([])
const gradeOptions = ref([])
// 表单数据
const form = reactive({
  brands: [],
  defects: [],
  grades: [],
  isCandidate: 0
});

// 表格数据
const tableData = ref([]);

// 分页相关
const currentPage = ref(1);
const total = ref(0);
const pageSize = ref(14);

// 图片预览相关
const dialogVisible = ref(false);
const previewImage = ref('');

// 下发对话框引用
const publishDialog = ref(null);


// 获取选项数据
const fetchOptions = async () => {
  try {
    const { data } = await getallnames()
    brandOptions.value = data.brandNames || []
    defectOptions.value = data.defectNames || []
    gradeOptions.value = data.defectGrades || []
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}
// 修改后的获取数据方法
const getData = (p = null) => {
  if (typeof p === 'number') {
    currentPage.value = p
  }

    getSampleList(
      currentPage.value,
      pageSize.value,
      form.brands,
      form.defects,
      form.grades
    )
    .then(res => {
      if (res.data.code) {
            tableData.value = res.data.data.rows;
            total.value = res.data.data.total;
        } else {
            console.error('Invalid data structure returned from server:', res);
            ElMessage.error('查询失败');
        }

    })
    .catch(error => {
      console.error('查询失败:', error)
    })
}

// 处理查询按钮点击事件
const handleQuery = () => {
  currentPage.value = 1; // 重置到第一页
  getData();
};

// 处理图片预览
const handlePreview = (row) => {
  if (!row.fileName) {
      ElMessage.warning('该记录暂无图片');
      return;
  }

  // 这里需要根据实际接口替换图片路径处理逻辑
  // 示例：假设后端需要文件路径参数访问图片
  //previewImage.value = `/api/file/preview?path=${encodeURIComponent("C:\\project\\datase\\重新分类\\"+row.fileName)}`;
  const fullPath = `C:/project/dataset/重新分类/${row.fileName}`;
  //console.log(fullPath);
  previewImage.value = `/api/file/preview?path=${encodeURIComponent(fullPath)}`;

  dialogVisible.value = true;
};

// 处理删除操作
const handleDelete = (id) => {
  deleteSample(id)
    .then(res => {
          ElMessage.success('删除成功');
          getData();
      })
    .catch(error => {
          console.error('Error deleting sample:', error);
          ElMessage.error('删除失败');
      });
};



// 初始加载数据
//getData();


// 验证相关状态
const verifyDialogVisible = ref(false);
const verifyTableData = ref({
  summary: {
    verifyTime: '',
    successRate: 0,
    defectRates: []
  },
  details: []
});
const isVerifying = ref(false);

// 处理下发验证
const handleVerify = async () => {
  try {
    isVerifying.value = true;
    
    // 获取当前系统时间作为验证开始时间
    const verifyStartTime = new Date().getTime();
    
    // 新增：检查设备连接状态
    const connectionRes = await getAllMachineIsConnected();
    if (connectionRes.data.code !== 1) {
      throw new Error('获取设备状态失败');
    }
    
    // 检查是否有已连接的设备
    const hasConnectedDevice = connectionRes.data.data.some(
      device => device.isConnected === 1
    );
    
    if (!hasConnectedDevice) {
      ElMessage.warning('没有已连接的设备，请先连接设备');
      isVerifying.value = false;
      return;
    }

    ElMessage.info('正在验证，请稍候...');

    // 启动验证
    await axios.get('/start/verify');
    
    setTimeout(async () => {
      try {
        // 获取最新的验证记录
        const newestRes = await axios.get('/verify/newest');
        if (newestRes.data.code !== 1 || !newestRes.data.data?.id) {
          throw new Error('获取验证ID失败');
        }

        // 检查验证记录的生成时间是否在验证开始之后（允许1秒误差）
        const verifyEndTime = new Date(newestRes.data.data.verifyTime).getTime();
        const timeDifference = verifyEndTime - verifyStartTime;
        
        if (timeDifference < -10000) { // 允许10秒的误差
          throw new Error('验证失败');
        }

        const detailRes = await axios.get(`/verify/detail?id=${newestRes.data.data.id}`);
        if (detailRes.data.code !== 1) {
          throw new Error('获取详情失败');
        }

        const defectRates = calculateDefectRates(detailRes.data.data);

        verifyTableData.value = {
          summary: {
            verifyTime: newestRes.data.data.verifyTime,
            successRate: newestRes.data.data.successRate,
            defectRates: defectRates
          },
          details: detailRes.data.data.map(item => ({
            fileName: item.fileName,
            result: item.verifyResult,
            brandName: item.brandName,
            defectName: item.defectName,
            fullPath: `C:/project/dataset/重新分类/${item.fileName}`
          }))
        };

        verifyDialogVisible.value = true;
      } catch (error) {
        ElMessage.error(error.message || '验证失败');
      } finally {
        isVerifying.value = false;
      }
    }, 3000);
  } catch (error) {
    ElMessage.error('验证请求失败');
    isVerifying.value = false;
  }
};

const calculateDefectRates = (data) => {
  const defectStats = new Map();
  
  data.forEach(item => {
    const defect = item.defectName;
    if (!defectStats.has(defect)) {
      defectStats.set(defect, { total: 0, pass: 0 });
    }
    const stat = defectStats.get(defect);
    stat.total++;
    if (item.verifyResult === 1) stat.pass++;
  });

  return Array.from(defectStats).map(([defect, stat]) => ({
    defect,
    rate: stat.pass / stat.total
  }));
};



// 修改后的查看图片方法
const handleViewImage = (row) => {
  if (row.fullPath) {
    //console.log(row.fullPath);
    previewImage.value = `/api/file/preview?path=${encodeURIComponent(row.fullPath)}`;
    dialogVisible.value = true;
  } else {
    ElMessage.warning('该记录暂无原图');
  }
};
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
}

.image-error .el-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

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