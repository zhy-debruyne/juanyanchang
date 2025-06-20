//createRouter: 创建路由实例
//createWebHistory: 创建一个基于浏览器的history路由

import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/index.vue'
import Admin from '@/layout/admin.vue'
import Home from '@/views/home/index.vue'
import Brand from '@/views/brand/index.vue'
import Machine from '@/views/machine/index.vue'
import User from '@/views/user/index.vue'
import Defect from '@/views/defect/nomachine/index.vue'
import DefectM from '@/views/defect/ismachine/index.vue'
import History from '@/views/history/index.vue'
import Sample from '@/views/files/sample/index.vue' 
import Alternative from '@/views/files/alternative/index.vue'
import Samplemachine from '@/views/files/samplemachine/index.vue'
import Normal from '@/views/files/normal/index.vue'
import Shift from '@/views/shift/index.vue'
import Verify from '@/views/verify/index.vue'
import Index from '@/views/index.vue'
import NotFound from '@/views/404.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //path和component对应关系的位置
  routes: [
    {
      path: '/',
      component:Admin,
      children:[
        {
          path: '/',
          component: Home,
          meta:{
            title:'首页'
          }
        },
        {
          path: '/brand',
          component: Brand,
          meta:{
            title:'品牌管理'
          }
        },
        {
          path: '/machine',
          component: Machine,
          meta:{
            title:'设备管理'
          }
        },
        {
          path: '/user',
          component: User,
          meta:{
            title:'普通用户管理'
          }
        },
        {
          path: '/defect',
          component: Defect,
          meta:{
            title:'缺陷管理'
          }
        },
        {
          path: '/defectmachine',
          component: DefectM,
          meta:{
            title:'设备缺陷管理'
          }
        },
        {
          path: '/history',
          component: History,
          meta:{
            title:'历史记录'
          }
        },
        {
          path: '/verify',
          component: Verify,
          meta:{
            title:'验证历史记录'
          }
        },
        {
          path: '/sample',
          component: Sample,
          meta:{
            title:'数字样库'
          }
        },
        {
          path: '/alternative',
          component: Alternative,
          meta:{
            title:'备选数字样库'
          }
        },
        {
          path: '/samplemachine',
          component: Samplemachine,
          meta:{
            title:'缺陷源图库'
          }
        },
        {
          path: '/normal',
          component: Normal,
          meta:{
            title:'设备源正常图片'
          }
        },
        {
          path: '/shift',
          component: Shift,
          meta:{
            title:'班次管理'
          }
        },
      ]
    },
    {
      path: '/login',
      component: Login,
      meta:{
        title:'登录'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFound,
      meta:{
        title:'404'
      }
    }
  ],
})

export default router
