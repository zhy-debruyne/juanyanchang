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

        <!-- 验证结果对话框 -->
        <el-dialog v-model="verifyDialogVisible" title="验证结果" width="80%" class="verify-result-dialog">
          <div v-if="allResults.length > 0" style="max-height: 70vh; overflow-y: auto;">
            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
              <el-select v-model="currentMachineId" @change="switchMachine" style="width: 200px;">
                <el-option
                  v-for="result in allResults"
                  :key="result.machineID"
                  :label="`设备 ${result.machineID}`"
                  :value="result.machineID"
                />
              </el-select>
              
              <div class="verification-summary">
                <div class="summary-item">
                  <span class="summary-label">设备ID:</span>
                  <span class="summary-value">{{ currentResult.machineID }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">验证时间:</span>
                  <span class="summary-value">{{ formatDateTime(currentResult.verifyTime) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">验证成功率:</span>
                  <span class="summary-value success-rate">{{ (currentResult.successRate * 100).toFixed(2) }}%</span>
                </div>
              </div>
            </div>
            
            <div v-if="currentResult">
              <!-- 缺陷通过率表格 - 紧凑布局 -->
              <div class="compact-defect-table">
                <div class="defect-header">
                  <div class="defect-cell" style="flex: 3;">缺陷类型</div>
                  <div class="defect-cell" style="flex: 2;">通过率</div>
                  <div class="defect-cell" style="flex: 5;">进度</div>
                </div>
                
                <div 
                  v-for="(defect, index) in currentResult.defectRates" 
                  :key="index"
                  class="defect-row"
                  :class="{
                    'high-rate': defect.rate >= 0.8,
                    'medium-rate': defect.rate >= 0.5 && defect.rate < 0.8,
                    'low-rate': defect.rate < 0.5
                  }"
                >
                  <div class="defect-cell" style="flex: 3; font-weight: 500;">{{ defect.defect }}</div>
                  <div class="defect-cell" style="flex: 2; font-weight: bold;">{{ (defect.rate * 100).toFixed(2) }}%</div>
                  <div class="defect-cell" style="flex: 5;">
                    <div class="progress-container">
                      <div 
                        class="progress-bar" 
                        :style="{ width: `${defect.rate * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 验证详情表格 -->
              <el-table 
                :data="currentResult.details" 
                style="width: 100%; margin-top: 15px;"
                height="300"
              >
                <el-table-column label="编号" align="center" width="60">
                  <template #default="{ $index }">
                    {{ $index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column prop="brandName" label="品牌" align="center" />
                <el-table-column prop="defectName" label="缺陷类型" align="center" />
                <el-table-column prop="result" label="验证结果" align="center" width="120">
                  <template #default="{ row }">
                    <div 
                      class="result-tag"
                      :class="row.result === 1 ? 'pass-tag' : 'fail-tag'"
                    >
                      {{ row.result === 1 ? '通过' : '未通过' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="120">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" plain @click="handleViewImage(row)">查看图片</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div v-else>
            暂无验证结果
          </div>
        </el-dialog>
        
        <!-- 新增设备选择对话框 -->
        <el-dialog v-model="machineSelectDialogVisible" title="选择下发设备" width="30%">
          <el-table 
            :data="machineList" 
            style="width: 100%; max-height: 300px; overflow-y: auto;" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="machineName" label="设备名称" align="center" />
            <el-table-column prop="isConnected" label="状态" align="center" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isConnected === 1 ? 'success' : 'danger'" size="small">
                  {{ row.isConnected === 1 ? '已连接' : '未连接' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="machineSelectDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmMachineSelection">
                确定
              </el-button>
            </span>
          </template>
        </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref , onMounted, onBeforeUnmount, computed } from 'vue';
import { getSampleList, deleteSample, getallnames } from '@/apis/sample';
import { Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import axios from '@/axios';
import { getMachineData } from '@/apis/machine';

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

// 新增设备选择相关状态
const machineSelectDialogVisible = ref(false);
const machineList = ref([]);
const selectedMachines = ref([]);

// 获取设备列表
const fetchMachineList = async () => {
  try {
    const res = await getMachineData();
    if (res.data && res.data.code === 1) {
      machineList.value = res.data.data || [];
      machineSelectDialogVisible.value = true;
    } else {
      ElMessage.error('获取设备列表失败');
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
    ElMessage.error('获取设备列表失败');
  }
};

// 处理设备选择变化
const handleSelectionChange = (selection) => {
  selectedMachines.value = selection;
};

// 确认设备选择
const confirmMachineSelection = () => {
  if (selectedMachines.value.length === 0) {
    ElMessage.warning('请至少选择一台设备');
    return;
  }
  
  // 检查是否有已连接的设备
  const hasConnectedDevice = selectedMachines.value.some(
    device => device.isConnected === 1
  );
  
  if (!hasConnectedDevice) {
    ElMessage.warning('您选择的设备均未连接，请先连接设备');
    return;
  }
  
  machineSelectDialogVisible.value = false;
  startVerification();
};

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

  const fullPath = `C:/project/dataset/重新分类/${row.fileName}`;
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

// 验证相关状态
const verifyDialogVisible = ref(false);
const isVerifying = ref(false);

// 新增验证结果相关状态
const allResults = ref([]); // 所有设备的验证结果
const currentMachineId = ref(null); // 当前选中的设备ID
const currentResult = ref(null); // 当前显示的验证结果

// 计算当前选择的设备名称
const currentMachineName = computed(() => {
  if (!currentMachineId.value) return '';
  const machine = machineList.value.find(m => m.machineID == currentMachineId.value);
  return machine ? machine.machineName : `设备 ${currentMachineId.value}`;
});

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');
};

// 处理下发验证
const handleVerify = () => {
  // 先获取设备列表
  fetchMachineList().catch(error => {
    ElMessage.error('获取设备列表失败: ' + error.message);
  });
};

// 开始验证（在选择了设备后调用）
const startVerification = async () => {
  try {
    isVerifying.value = true;
    
    // 获取当前系统时间作为验证开始时间
    const verifyStartTime = new Date().getTime();
    
    ElMessage.info('正在验证，请稍候...');
    
    // 提取选中的设备ID
    const mids = selectedMachines.value.map(m => m.id);
    //提取选中设备的machineID
    const machineIds = selectedMachines.value.map(m => m.machineID);
    
    
    // 启动验证，传递设备ID
    await axios.get('/start/verify', {
      params: { machineIds: mids.join(',') }
    });
    
    // 设置轮询参数
    let pollCount = 0;
    const maxPollCount = 60; // 最大轮询次数（60秒超时）
    const pollInterval = 1000; // 轮询间隔1秒
    
    // 轮询函数 - 检查验证结果是否准备好
    const pollForResults = async () => {
      try {
        pollCount++;
        if (pollCount > maxPollCount) {
          ElMessage.error('验证超时，请检查设备状态');
          isVerifying.value = false;
          return;
        }
        
        // 获取所有设备的最新验证记录
        const allNewestRes = await axios.get('/verify/allNewest');
        if (allNewestRes.data.code !== 1 || !allNewestRes.data.data?.length) {
          // 如果没有有效结果，继续轮询
          setTimeout(pollForResults, pollInterval);
          return;
        }
        
        // 检查是否有本次验证的结果
        const currentResults = allNewestRes.data.data.filter(result => {
          const resultTime = new Date(result.verifyTime).getTime();
          return resultTime > verifyStartTime && machineIds.includes(result.machineID);
        });
        
        if (currentResults.length === 0) {
          // 结果尚未准备好，继续轮询
          setTimeout(pollForResults, pollInterval);
          return;
        }
        
        // 获取所有设备的详细结果
        allResults.value = [];
        for (const result of currentResults) {
          const detailRes = await axios.get(`/verify/detail?id=${result.id}`);
          if (detailRes.data.code !== 1) {
            continue;
          }
          
          const defectRates = calculateDefectRates(detailRes.data.data);
          
          allResults.value.push({
            machineID: result.machineID,
            verifyTime: result.verifyTime,
            successRate: result.successRate,
            id: result.id,
            defectRates: defectRates,
            details: detailRes.data.data.map(item => ({
              fileName: item.fileName,
              result: item.verifyResult,
              brandName: item.brandName,
              defectName: item.defectName,
              fullPath: `C:/project/dataset/重新分类/${item.fileName}`
            }))
          });
        }
        
        // 设置默认选中的设备
        if (allResults.value.length > 0) {
          currentMachineId.value = allResults.value[0].machineID;
          currentResult.value = allResults.value[0];
        }
        
        verifyDialogVisible.value = true;
        isVerifying.value = false;
      } catch (error) {
        ElMessage.error(error.message || '获取验证结果失败');
        isVerifying.value = false;
      }
    };
    
    // 开始轮询
    setTimeout(pollForResults, pollInterval);
  } catch (error) {
    ElMessage.error('验证请求失败: ' + error.message);
    isVerifying.value = false;
  }
};

// 切换设备查看不同结果
const switchMachine = (machineId) => {
  const result = allResults.value.find(r => r.machineID == machineId);
  if (result) {
    currentResult.value = result;
  } else {
    ElMessage.warning(`未找到设备 ${machineId} 的验证结果`);
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

/* 验证结果对话框固定高度 */
.verify-result-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

/* 新增样式用于验证结果表格 */
.verification-summary {
  display: flex;
  background-color: #f8fafc;
  border-radius: 4px;
  padding: 8px 15px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.summary-label {
  color: #606266;
  font-size: 14px;
  margin-right: 5px;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
}

.success-rate {
  color: #e6a23c;
  font-weight: bold;
}

/* 紧凑型缺陷表格样式 */
.compact-defect-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.defect-header {
  display: flex;
  background-color: #f5f7fa;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

.defect-row {
  display: flex;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}

.defect-row:last-child {
  border-bottom: none;
}

.defect-cell {
  padding: 0 5px;
}

/* 进度条样式 */
.progress-container {
  width: 100%;
  height: 16px;
  background-color: #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 8px;
}

/* 不同通过率的颜色分类 */
.high-rate .progress-bar {
  background-color: #67c23a;
}

.medium-rate .progress-bar {
  background-color: #e6a23c;
}

.low-rate .progress-bar {
  background-color: #f56c6c;
}

/* 自定义结果标签 */
.result-tag {
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
}

/* .pass-tag {
  background-color: #e8f4ff;
  color: #409eff;
} */
.pass-tag {
  background-color: #e1f3d8; /* 浅绿色背景 */
  color: #67c23a;            /* 深绿色文字 */
  border: 1px solid #c2e7b0; /* 浅绿色边框 */
}
.fail-tag {
  background-color: #ffeded;
  color: #f56c6c;
}
</style>