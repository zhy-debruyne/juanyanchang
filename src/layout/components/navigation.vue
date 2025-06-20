<template>
  <div class="f-menu">
      <el-menu :default-active="defaultActive" default-active="2" class="border-0" @select="handleSelect">

          <template v-for="(item,index) in asideMenus" :key="index">
              <el-sub-menu v-if="item.child && item.child.length > 0" :index="item.name">
                  <template #title>
                      <el-icon>
                          <component :is="item.icon"></component>
                      </el-icon>
                      <span>{{ item.name }}</span>
                  </template>
                  <el-menu-item v-for="(item2,index2) in item.child" :key="index2" :index="item2.frontpath">
                      <el-icon>
                          <component :is="item2.icon"></component>
                      </el-icon>
                      <span>{{ item2.name }}</span>
                  </el-menu-item>
              </el-sub-menu>

              <el-menu-item v-else :index="item.frontpath">
                  <el-icon>
                       <component :is="item.icon"></component>
                  </el-icon>
                  <span>{{ item.name }}</span>
              </el-menu-item>
          </template>
      </el-menu>
  </div>
</template>
<script setup>
import { computed,ref } from 'vue';
import { useRouter,useRoute} from 'vue-router';
const router = useRouter()
const route = useRoute()

const defaultActive = ref(route.path)

const asideMenus = [{
  "name": "首页",
  "icon": "House",
  "frontpath": "/",
}, 
{
  "name": "数字样库管理",
  "icon": "Files",
  "child": [{
      "name": "数字样库",
      "icon": "FolderOpened",
      "frontpath": "/sample",
  },
  {
      "name": "备选数字样库",
      "icon": "Folder",
      "frontpath": "/alternative",
  },
  {
      "name": "缺陷源图库",
      "icon": "PictureFilled",
      "frontpath": "/samplemachine",
  },
  {
      "name": "设备源正常图片",
      "icon": "MessageBox",
      "frontpath": "/normal",

  }
  ]
},
{
  "name": "设备管理",
  "icon": "Monitor",
  "frontpath": "/machine",
},
{
  "name": "品牌管理",
  "icon": "Fries",
  "frontpath": "/brand",
},
{
  "name": "缺陷种类管理",
  "icon": "Warning",
  "child": [{
      "name": "标注后缺陷种类",
      "frontpath": "/defect",
    },
  {
      "name": "设备源缺陷种类",
      "frontpath": "/defectmachine",
  }]
},
{
  "name": "普通用户管理",
  "icon": "User",
  "frontpath": "/user",
},
{
  "name": "设备状态历史",
  "icon": "Memo",
  "frontpath": "/history",
},
{
  "name": "验证结果历史",
  "icon": "Notification",
  "frontpath": "/verify",
},
{
  "name": "班次管理",
  "icon": "Clock",
  "frontpath": "/shift",
}
// {
//   "name": "个人中心",
//   "icon": "User",
//   "frontpath": "/personal",
// }
]

const handleSelect = (e)=>{
  router.push(e)
}
</script>
<style>
.f-menu {
  width: 250px;
  top: 64px;
  bottom: 0;
  left: 0;
  overflow: auto;
  @apply shadow-md fixed bg-light-50;
}
</style>