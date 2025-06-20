// src/composables/usePermission.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useAdminPermission() {
  const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')

  const checkAdminStatus = () => {
    isAdmin.value = localStorage.getItem('isAdmin') === 'true'
  }

  const setupPermissionListener = () => {
    onMounted(() => {
      window.addEventListener('storage', checkAdminStatus)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('storage', checkAdminStatus)
    })
  }

  return {
    isAdmin,
    setupPermissionListener
  }
}

// 新增统一的禁用属性配置
export const usePermissionProps = () => ({
  button: {
    disabled: (isAdmin) => ({ disabled: !isAdmin.value })
  },
  popconfirm: {
    disabled: (isAdmin) => ({ disabled: !isAdmin.value })
  }
})