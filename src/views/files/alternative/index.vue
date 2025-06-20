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
              <!--推荐指数多选下拉-->
              <el-form-item label="推荐指数">
                <el-select
                  v-model="form.nps"
                  multiple
                  collapse-tags
                  placeholder="请选择指数"
                  style="width: 200px"
                >
                  <el-option
                    v-for="item in npsOptions"
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
          <el-table-column prop="nps" label="推荐指数" align="center" />
          <el-table-column label="操作" align="center" width="300px">
              <template #default="scope">
                  <el-button type="primary" size="small" text @click="handlePreview(scope.row)">查看图片</el-button>
                  <el-button type="danger" size="small" text @click="handleEdit(scope.row)" :disabled="!isAdmin">修改</el-button>
                  <el-button type="primary" size="small" text @click="upLoad(scope.row)">导入到数字样库</el-button>
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

      <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
          <el-form :model="editForm" ref="formRef" :rules="rules" label-width="80px" :inline="false">
              <el-form-item label="缺陷类型" prop="defectName">
                  <el-input v-model="editForm.defectName" placeholder="缺陷类型" /> 
              </el-form-item>
              <el-form-item label="缺陷等级" prop="defectGrade">
                  <el-input v-model="editForm.defectGrade" placeholder="缺陷等级" /> 
              </el-form-item>
          </el-form>
      </FormDrawer>
  </el-card>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount  } from 'vue';
import { 
  getSamplebList,
  updateSampleb,
  addSample,
  getallnamesb
} from '@/apis/sample';
import { Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';


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
const npsOptions = ref([])
// 表单数据
const form = reactive({
  brands: [],
  defects: [],
  grades: [],
  nps: [],
});

const tableData = ref([]);

// 分页
const currentPage = ref(1);
const total = ref(0);
const pageSize = ref(14);


// 获取选项数据
const fetchOptions = async () => {
  try {
    const { data } = await getallnamesb()
    brandOptions.value = data.brandNames || []
    defectOptions.value = data.defectNames || []
    gradeOptions.value = data.defectGrades || []
    //npsOptions.value = data.nps || []
     // 添加排序处理（升序）
     npsOptions.value = (data.nps || []).sort((a, b) => a - b)
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}
// 获取数据
const getData = (p = null) => {
  if (typeof p === 'number') {
    currentPage.value = p
  }

    getSamplebList(
      currentPage.value,
      pageSize.value,
      form.brands,
      form.defects,
      form.grades,
      form.nps
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

// 查看图片
// 新增图片预览相关状态
const dialogVisible = ref(false);
const previewImage = ref('');

// 处理图片预览
const handlePreview = (row) => {
  if (!row.fileName) {
      ElMessage.warning('该记录暂无图片');
      return;
  }

  // 这里需要根据实际接口替换图片路径处理逻辑
  // 示例：假设后端需要文件路径参数访问图片
  //previewImage.value = `/api/file/preview?path=${"C:\\project\\datase\\重新分类\\"+encodeURIComponent(row.fileName)}`;
  const fullPath = `C:/project/dataset/重新分类/${row.fileName}`;
  previewImage.value = `/api/file/preview?path=${encodeURIComponent(fullPath)}`;

  dialogVisible.value = true;
};

// 修改部分
const formDrawerRef = ref(null);
const formRef = ref(null);
const editForm = reactive({
  sampleID: '',
  isCandidate: '',
  defectID: '',
  defectGrade: ''
});
const rules = {
  defectName: [
      {
          required: true,
          message: '请输入缺陷类型',
          trigger: 'blur'
      }
  ],
  defectGrade: [
      {
          required: true,
          message: '请输入缺陷等级',
          trigger: 'blur'
      }
  ]
};
const editId = ref(0);
const drawerTitle = ref('修改备选数字样信息');

// const handleSubmit = () => {
//   formRef.value.validate((valid) => {
//       if (!valid) return;

//       updateSampleb(editForm)
//         .then(res => {
//               ElMessage.success('修改成功');
//               getData(editId.value ? false : 1);
//               formDrawerRef.value.close();
//           })
//         .catch(error => {
//               ElMessage.error('修改失败');
//           });
//   });
// };

// 重置表单
const resetForm = (row = false) => {
  if (formRef.value) formRef.value.clearValidate();
  if (row) {
      for (const key in editForm) {
          editForm[key] = row[key];
      }
  }
};

// 修改
const handleEdit = (row) => {
  editId.value = row.sampleID;
  formDrawerRef.value.open();
  resetForm(row);
};

// 导入到下发数字样库
// 修改 upLoad 函数
const upLoad = (row) => {
  addSample({
    sampleID: row.sampleID
  })
  .then(res => {
    ElMessage.success('导入成功');
    // 修改这里：移除分页重置参数，保持当前页
    getData(); // 直接调用无参版本
  })
  .catch(error => {
    ElMessage.error('导入失败');
  });
};

// 同时修改 handleSubmit 函数（保持一致性）
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return;

    updateSampleb(editForm)
      .then(res => {
        ElMessage.success('修改成功');
        // 修改这里：同样移除分页重置参数
        getData(); // 直接调用无参版本
        formDrawerRef.value.close();
      })
      .catch(error => {
        ElMessage.error('修改失败');
      });
  });
};

// 初始加载数据
//getData();
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