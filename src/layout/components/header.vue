<template>
  <div class="f-header">
    <span class="logo">
      <el-icon class="mr-1"><eleme-filled /></el-icon>
      数字样验证平台
    </span>

    <el-button 
      @click="showLoginDialog = true" 
      v-if="!isAdmin"
    >管理员登录</el-button>
    
    <el-button 
      @click="handleLogout" 
      v-if="isAdmin"
    >退出登录</el-button>
    
    

    <LoginDialog 
      :visible="showLoginDialog"
      @update:visible="val => showLoginDialog = val"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
//import { getUserNameList } from '@/apis/user'
import LoginDialog from '@/components/LoginDialog.vue'

const showLoginDialog = ref(false)
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')
const employee = ref('')


const handleLoginSuccess = (payload) => {
  isAdmin.value = true
  ElMessage.success(`欢迎管理员 ${payload.username}`)
}

const handleLogout = () => {
  localStorage.removeItem('isAdmin')
  localStorage.removeItem('token')
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'isAdmin',
    newValue: null,
    oldValue: 'true',
    storageArea: localStorage
  }))
  isAdmin.value = false
  ElMessage.success('退出成功')
}

// onMounted(() => {
//   getUserNameList()
//     .then(response => {
//       if (response.data.code === 1) {
//         employee.value = response.data.data[0]
//       }
//     })
//     .catch(console.error)
// })
</script>


<style>
.f-header {
  @apply flex items-center bg-blue-400 text-light-50 fixed top-0 left-0 right-0;
  height: 64px;
  z-index: 1000;
}

.logo {
  width: 250px;
  @apply flex justify-center items-center text-xl font-thin; 
}
</style>