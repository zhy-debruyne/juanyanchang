<template>
  <el-dialog
    v-model="dialogVisible"
    title="管理员登录"
    width="30%"
    :before-close="handleClose"
    class="login-dialog"
  >
    <el-form 
      ref="loginFormRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @keyup.enter="handleLogin"
    >
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="form.username"
          placeholder="请输入管理员账号"
          clearable
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button 
          type="primary"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '@/apis/login' // 假设登录接口

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const loginFormRef = ref(null)

const form = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 3, max: 18, message: '长度在 3 到 18 个字符', trigger: 'blur' }
  ]
})

// 同步父组件状态
watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    const { username: userName, password: userPassword } = form
    const token = await login(userName, userPassword)
    
    // 设置管理员状态并触发事件
    localStorage.setItem('isAdmin', true)
    localStorage.setItem('token', token)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'isAdmin',
      newValue: 'true',
      oldValue: localStorage.getItem('isAdmin'),
      storageArea: localStorage
    }))

    emit('success', { isAdmin: true, username: form.username })
    ElMessage.success('登录成功')
    closeDialog()
  } catch (error) {
    const message = error.response?.data?.message || '登录失败，请检查用户名或密码'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const handleClose = (done) => {
  if (form.username || form.password) {
    ElMessage.info('登录信息未保存')
    return
  }
  done()
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  loginFormRef.value?.resetFields()
}
</script>

<style scoped>
.login-dialog {
  z-index: 9999 !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>