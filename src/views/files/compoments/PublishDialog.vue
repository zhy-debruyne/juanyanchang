<template>
    <!-- 下发弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="下发数字样"
      width="600px"
      class="publish-dialog"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="form" 
        label-width="150px" 
        label-position="right"
        :rules="rules"
        ref="formRef"
      >
        <!-- 设备选择区域 -->
    <div class="m-4">
        <el-form-item label="设备所在产线：" prop="productionLine" >
          <el-select
            v-model="form.productionLine"
            placeholder="请选择产线"
            multiple
            @change="handleLineChange"
            style="width: 240px"
            
          >
            <el-option
              v-for="item in productionLines"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
    </div>
  
    <div class="m-4">
        <el-form-item label="设备名称：" prop="device">
          <el-select
            v-model="form.device"
            placeholder="请选择设备"
            multiple
            :disabled="!form.productionLine"
            style="width: 240px"
          >
            <el-option
              v-for="item in filteredDevices"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
    </div>
  
    <div class="m-4">
        <!-- 品牌选择区域 -->
        <el-form-item label="品牌名称：" prop="brand">
          <el-select
            v-model="form.brand"
            placeholder="请选择品牌"
            multiple
            style="width: 240px"
          >
            <el-option
              v-for="item in brands"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
    </div>
  
    <div class="m-4">
        <!-- 缺陷类型 -->
        <el-form-item label="缺陷类型：" prop="defectType">
          <el-select
            v-model="form.defectType"
            placeholder="请选择缺陷类型"
            multiple
            style="width: 240px"
          >
            <el-option
              v-for="item in defectTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
    </div>
  
        <!-- 操作按钮 -->
        <el-form-item class="m-4">
          <el-button @click="handleCancel" class="m-4">返回</el-button>
          <el-button type="primary" @click="handleSubmit" class="m-4">下发</el-button>
          <el-button type="primary" @click="handleSubmitAndReturn" class="m-4">
            下发并返回设备详情页面
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue'
  
  // 弹窗显示控制
  const dialogVisible = ref(false)
  const formRef = ref(null)
  
  // 表单数据
  const form = reactive({
    productionLine: '',
    device: '',
    brand: '',
    defectType: ''
  })
  
  // 校验规则
  const rules = reactive({
    productionLine: [
      { required: true, message: '请选择产线', trigger: 'change' }
    ],
    device: [
      { required: true, message: '请选择设备', trigger: 'change' }
    ],
    brand: [
      { required: true, message: '请选择品牌', trigger: 'change' }
    ]
  })
  
  // 模拟数据源
  const productionLines = ref([
    { value: 'line1', label: '产线1' },
    { value: 'line2', label: '产线2' },
    { value: 'line3', label: '产线3' }
  ])
  
  const devices = ref([
    { value: 'device1', label: '设备1', line: 'line1' },
    { value: 'device2', label: '设备2', line: 'line1' },
    { value: 'device3', label: '设备3', line: 'line2' },
    { value: 'device4', label: '设备4', line: 'line3' }
  ])
  
  const brands = ref([
    { value: 'brand1', label: '品牌1' },
    { value: 'brand2', label: '品牌2' },
    { value: 'brand3', label: '品牌3' }
  ])
  
  
  const defectTypes = ref([
    { value: 'type1', label: '缺陷1' },
    { value: 'type2', label: '缺陷2' },
    { value: 'type3', label: '缺陷3' }
  ])
  
  // 计算属性：过滤设备列表
  const filteredDevices = computed(() => {
    if (!form.productionLine) return []
    return devices.value.filter(
      device => device.line === form.productionLine
    )
  })
  
  // 产线变更处理
  const handleLineChange = () => {
    form.device = '' // 清空设备选择
  }
  
  // 打开弹窗
  const openDialog = () => {
    dialogVisible.value = true
  }
  
  // 关闭弹窗
  const closeDialog = () => {
    dialogVisible.value = false
  }
  
  // 表单提交
  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      // 这里添加下发API调用
      console.log('下发数据：', form)
      ElMessage.success('下发成功')
      closeDialog()
    } catch (error) {
      ElMessage.error('请填写完整信息')
    }
  }
  
  // 下发并返回
  const handleSubmitAndReturn = () => {
    handleSubmit()
    // 添加返回设备详情逻辑
  }
  
  // 取消操作
  const handleCancel = () => {
    closeDialog()
  }
  
  // 暴露方法
  defineExpose({ openDialog })
  </script>
  
<style scoped>
  
</style>