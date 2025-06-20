import './assets/global.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 中文语言包
import 'dayjs/locale/zh-cn' // dayjs 中文配置

import App from './App.vue'
import router from './router'

import 'virtual:windi.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

app.use(createPinia())
app.use(router)

app.use(ElementPlus, {
  locale: zhCn, // 设置语言为中文
})



app.mount('#app')
