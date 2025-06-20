<template>
    <el-config-provider :locale="zhCn">
      <el-card shadow="never" class="border-1">
      <div class="flex items-center justify-between mb-4">
        <el-button 
          type="primary" 
          @click="handleCreate" 
          :disabled="!isAdmin"
        >新增</el-button>
      </div>
  
      <el-table :data="tableData" height="680px">
        <el-table-column label="序号" align="center" width="60px">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
  
        <el-table-column prop="shiftName" align="center" label="班次名称"/>
        
        <el-table-column prop="beginTime" align="center" label="开始时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.beginTime) }}
          </template>
        </el-table-column>
  
        <el-table-column prop="endTime" align="center" label="结束时间">
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
  
        <el-table-column align="center" label="操作" width="180">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              text 
              @click="handleEdit(scope.row)"
              :disabled="!isAdmin"
            >修改</el-button>
            <el-popconfirm 
              title="确定要删除该班次吗?" 
              confirm-button-text="确定" 
              cancel-button-text="取消" 
              @confirm="handleDelete(scope.row.id)"
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
        <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
          <el-form-item label="班次名称" prop="shiftName">
            <el-input v-model="form.shiftName" placeholder="请输入班次名称"/>
          </el-form-item>
          
          <el-form-item label="开始时间" prop="beginTime">
            <el-date-picker
              v-model="form.beginTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择开始时间"
            />
          </el-form-item>
  
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择结束时间"
            />
          </el-form-item>
        </el-form>
      </FormDrawer>
      </el-card>
    </el-config-provider>
  </template>
  
  <script setup>
  import { ElConfigProvider } from 'element-plus'
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
  import 'dayjs/locale/zh-cn'
  import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
  import FormDrawer from '@/components/FormDrawer.vue'
  import { 
    getShiftList,
    addShift,
    updateShift,
    deleteShift
  } from '@/apis/shift'
  import { ElMessage } from 'element-plus'
  
  // 权限管理
  const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')
  
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
  
  // 时间格式化
  const formatDateTime = (datetime) => {
    return datetime ? datetime.replace('T', ' ') : ''
  }
  
  // 获取数据
  const getData = (p = null) => {
    if (typeof p === 'number') currentPage.value = p
    
    getShiftList(currentPage.value, pageSize.value)
      .then(res => {
        if(res.data.code === 1) {
          tableData.value = res.data.data.rows
          total.value = res.data.data.total
        }
      })
      .catch(error => {
        ElMessage.error('获取班次列表失败')
        console.error(error)
      })
  }
  
  // 删除操作
  const handleDelete = (id) => {
    deleteShift(id)
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
    id: '',
    shiftName: '',
    beginTime: '',
    endTime: ''
  })
  
  const rules = {
    shiftName: [{ required: true, message: '请输入班次名称', trigger: 'blur' }],
    beginTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
  }
  
  const editId = ref(0)
  const drawerTitle = computed(() => editId.value ? '修改班次' : '新增班次')
  
  const handleSubmit = () => {
    formRef.value.validate(valid => {
      if (!valid) return
  
      const apiAction = editId.value 
        ? updateShift({ ...form, ID: form.id }) 
        : addShift(form)
  
      apiAction.then(() => {
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
      form.id = row.id // 保持ID字段映射
    }
  }
  
  const handleCreate = () => {
    editId.value = 0
    resetForm({ shiftName: '', beginTime: '', endTime: '' })
    formDrawerRef.value.open()
  }
  
  const handleEdit = (row) => {
    editId.value = row.id
    resetForm(row)
    formDrawerRef.value.open()
  }
  </script>