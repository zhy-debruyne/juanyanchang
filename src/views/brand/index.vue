<template>
  <el-card shadow="never" class="border-1">
    <div class="flex items-center justify-between mb-4">
      <el-button 
        type="primary" 
        @click="handleCreate" 
        :disabled="!isAdmin"
      >新增</el-button>
    </div>
    
    <el-table :data="tableData" height="680px">
      <el-table-column label="编号" align="center" width="60px">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      
      <el-table-column prop="brandName" align="center" label="品牌名称"/>
      
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button 
            type="primary" 
            size="small" 
            text 
            @click="handleEdit(scope.row)"
            :disabled="!isAdmin"
          >修改</el-button>
          <el-popconfirm 
            title="您确定要删除吗?" 
            confirm-button-text="确定" 
            cancel-button-text="取消" 
            @confirm="handleDelete(scope.row.brandID)"
            :disabled="!isAdmin"
          >
            <template #reference>
              <el-button 
                type="danger" 
                size="small" 
                text 
                :disabled="!isAdmin"
              >删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination 
        layout="prev, pager, next" 
        :total="total"
        :current-page="currentPage" 
        :page-size="pageSize" 
        @current-change="getData" 
      />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="品牌名称" />
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import FormDrawer from '@/components/FormDrawer.vue'
import { 
  getBrandList,
  addBrand,
  updateBrand, 
  deleteBrand
} from '@/apis/brand'
import { ElMessage } from 'element-plus'

// 管理员状态管理
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')

// 监听storage变化
const checkAdminStatus = () => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
}

onMounted(() => {
  window.addEventListener('storage', checkAdminStatus)
  getData()
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', checkAdminStatus)
})

// 数据列表
const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)

const getData = (p = null) => {
  if (typeof p === 'number') currentPage.value = p
  
  getBrandList(currentPage.value, pageSize.value)
    .then(res => {
      tableData.value = res.data.data.rows
      total.value = res.data.data.total
    })
    .catch(error => {
      ElMessage.error('获取数据失败')
      console.error(error)
    })
}

// 删除操作
const handleDelete = (id) => {
  deleteBrand(id)
    .then(() => {
      ElMessage.success('删除成功')
      getData()
    })
    .catch(error => {
      ElMessage.error('删除失败')
      console.error(error)
    })
}

// 表单相关
const formDrawerRef = ref(null)
const formRef = ref(null)
const form = reactive({
  brandID: '',
  brandName: ''
})

const rules = {
  brandName: [{
    required: true,
    message: '请输入品牌名称',
    trigger: 'blur'
  }]
}

const editId = ref(0)
const drawerTitle = computed(() => editId.value ? '修改品牌' : '新增品牌')

const handleSubmit = () => {
  formRef.value.validate(valid => {
    if (!valid) return

    const action = editId.value ? updateBrand(form) : addBrand(form)
    
    action.then(() => {
      ElMessage.success(drawerTitle.value + '成功')
      getData(editId.value ? currentPage.value : 1)
      formDrawerRef.value.close()
    }).catch(error => {
      ElMessage.error(drawerTitle.value + '失败')
      console.error(error)
    })
  })
}

const resetForm = (row) => {
  if (formRef.value) formRef.value.resetFields()
  if (row) {
    Object.keys(form).forEach(key => {
      form[key] = row[key]
    })
  }
}

const handleCreate = () => {
  editId.value = 0
  resetForm({ brandName: '' })
  formDrawerRef.value.open()
}

const handleEdit = (row) => {
  editId.value = row.brandID
  resetForm(row)
  formDrawerRef.value.open()
}
</script>

<style>

</style>