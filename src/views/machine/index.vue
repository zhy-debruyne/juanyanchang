<template>
  <el-card shadow="never" class="border-1">
    <div class="flex items-center justify-between mb-4">
      <el-button type="primary" @click="handleCreate" :disabled="!isAdmin">新增</el-button>
    </div>
    <el-table :data = "tableData" height="680px">
      <el-table-column  label="编号" align="center" width="60px">
        <template #default="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="machineID" label="设备编号" align="center"/>
      <el-table-column prop="machineName" label="设备名称" align="center"/>
      <el-table-column prop="lineName" label="产线名称" align="center"/>
      <el-table-column prop="ipaddress" label="设备IP地址" align="center"/>
      <el-table-column label="操作"  align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)" :disabled="!isAdmin">修改</el-button>
          <el-popconfirm title="您确定要删除吗?" confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(scope.row.id)" :disabled="!isAdmin">
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
         <el-form-item label="设备编号" prop="machineID">
          <el-input v-model="form.machineID" placeholder="设备编号" />
        </el-form-item>
         <el-form-item label="设备名称" prop="machineName">
           <el-input v-model="form.machineName" placeholder="设备名称" />
         </el-form-item>
         <el-form-item label="产线名称" prop="lineName">
           <el-input v-model="form.lineName" placeholder="产线名称" />
         </el-form-item>
         <el-form-item label="设备IP地址" prop="ipaddress">
           <el-input v-model="form.ipaddress" placeholder="设备IP地址" />
         </el-form-item>
        </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive,  computed , onMounted, onBeforeUnmount} from 'vue'
import FormDrawer from '@/components/FormDrawer.vue'
import {
   getMachineList,
   addMachine,
   updateMachine,
   deleteMachine
  } from '@/apis/machine'
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

  getMachineList(currentPage.value, pageSize.value)
    .then(res => {
      //console.log('Received data:', res);
      tableData.value = res.data.data.rows
      total.value = res.data.data.total
    })
    .catch(error => {
      console.error('Error fetching machine list:', error);
    })
}

getData()

//删除
const handleDelete = (id)=>{
  deleteMachine(id).then(res => {
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
  machineID:'',
  machineName:'',
  lineName:'',
  ipaddress:''
})
const rules = {
  machineID: [{
    required: true,
    message: '请输入设备编号',
    trigger: 'blur'
  }],
  machineName: [{
    required: true,
    message: '请输入设备名称',
    trigger: 'blur'
  }],
  lineName: [{
    required: true,
    message: '请输入产线名称',
    trigger: 'blur'
  }],
  ipaddress: [{
    required: true,
    message: '请输入设备IP地址',
    trigger: 'blur'
  }]
}

//修改标识 0：新增 其他：修改
const editId = ref(0)
const drawerTitle = computed(()=> editId.value === 0 ? '新增设备' : '修改设备')
const handleSubmit = ()=>{
  formRef.value.validate((valid)=>{
    if(!valid) return

    const fun = editId.value ? updateMachine(form) : addMachine(form)

    fun.then(res => {
        ElMessage.success(drawerTitle.value + '成功')
        //toast(drawerTitle.value + '成功')
        //修改刷新当前页，新增刷新第一页
        getData(editId.value ? false : 1)
        formDrawerRef.value.close()
      })
      .catch(error => {
        ElMessage.error(drawerTitle.value + '失败')
        console.error('Error fetching machine list:', error);
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
    machineName:'',
    lineName:'',
    ipaddress:''
  })
  formDrawerRef.value.open()
}

//修改
const handleEdit = (row)=>{
  editId.value = row.machineID
  formDrawerRef.value.open()
  resetForm(row)
}
</script>

<style scoped>

</style>