<template>
    <el-card shadow="never" class="border-1">
      <div class="flex items-center justify-between mb-4">
      <el-button type="primary" @click="handleCreate" :disabled="!isAdmin">新增</el-button>
    </div>
      <el-table  :data = "tableData" height="680px">
        <el-table-column  label="编号" align="center" width="60px">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
        <el-table-column prop="userName"  label="用户名"  align="center"/>
        <el-table-column prop="realName"  label="真实姓名"  align="center"/>
        <el-table-column prop="job"  label="工作岗位"  align="center"/>
        <el-table-column align="center" label="操作" >
          <template #default="scope">
            <el-button type="primary" size="small" text @click="handleEdit(scope.row)" :disabled="!isAdmin">修改</el-button>
            <el-popconfirm title="您确定要删除吗?" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(scope.row.userID)" :disabled="!isAdmin">
              <template #reference>
                <el-button type="danger" size="small" text :disabled="!isAdmin">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex items-center justify-center mt-5">
        <el-pagination layout="prev, pager, next" :total="total"
        :current-page="currentPage" :page-size="pageSize" @current-change="getData" />
      </div>

      <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
       <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" :inline="false">
         <el-form-item label="用户名" prop="userName">
           <el-input v-model="form.userName" placeholder="用户名" />
         </el-form-item>
         <el-form-item label="真实姓名" prop="realName">
           <el-input v-model="form.realName" placeholder="真实姓名" />
         </el-form-item>
         <el-form-item label="工作岗位" prop="job">
           <el-input v-model="form.job" placeholder="工作岗位" />
         </el-form-item>
        </el-form>
    </FormDrawer>
    </el-card>
</template>

<script setup>
import { ref, reactive, computed , onMounted, onBeforeUnmount} from 'vue'
import FormDrawer from '@/components/FormDrawer.vue';
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser
} from '@/apis/user'
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



const tableData = ref([])

//分页
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)

//获取数据
function getData(p = null){
  if(typeof p === 'number'){
    currentPage.value = p
  }

  getUserList(currentPage.value, pageSize.value)
    .then(res => {
      //console.log('Received data:', res);
      tableData.value = res.data.data.rows
      total.value = res.data.data.total
    })
    .catch(error =>{
      console.error('Error fetching user list:', error);
    })
}

getData()

//删除
const handleDelete = (id)=>{
  deleteUser(id).then(res => {
    //toast('删除成功')
    ElMessage.success('删除成功');
    getData()
  })
  .catch(error => {
    ElMessage.error('删除失败');
  })
}

//表单部分
const formDrawerRef = ref(null)
const formRef = ref(null)
const form = reactive({
  userID:'',
  userName:'',
  realName:'',
  job:''
})
const rules = {
  userName: [{
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  }],
  realName: [{
    required: true,
    message: '请输入真实姓名',
    trigger: 'blur'
  }],
  job: [{
    required: true,
    message: '请输入工作岗位',
    trigger: 'blur'
  }]
}

//修改标识 0：新增 其他：修改
const editId = ref(0)
const drawerTitle = computed(()=> editId.value === 0 ? '新增普通用户' : '修改普通用户')
const handleSubmit = ()=>{
  formRef.value.validate((valid)=>{
    if(!valid) return

    const fun = editId.value ? updateUser(form) : addUser(form)

    fun.then(res => {
        ElMessage.success(drawerTitle.value + '成功')
        //toast(drawerTitle.value + '成功')
        //修改刷新当前页，新增刷新第一页
        getData(editId.value ? false : 1)
        formDrawerRef.value.close()
      })
      .catch(error => {
        ElMessage.error(drawerTitle.value + '失败')
        console.error('Error fetching user list:', error);
      })
      .finally(()=>{
        
      })
  })
}

//重置表单
function resetForm(row = false){
  if(formRef.value) formRef.value.clearValidate()
  if(row){
    for(const key in form){
      form[key] = row[key]
    }
  }
}

//新增
const handleCreate = ()=>{
  editId.value = 0
  resetForm({
    userName: '',
    realName: '',
    job: ''
  })
  formDrawerRef.value.open()
}

//修改
const handleEdit = (row)=>{
  editId.value = row.userID
  formDrawerRef.value.open()
  resetForm(row)
}
</script>