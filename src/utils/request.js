//axios基础封装
import axios from 'axios'

const service = axios.create({
  baseURL: "http://192.168.0.110:8881/",
  timeout: 10000
})

//拦截器
//axios的请求拦截器
service.interceptors.request.use(config => {
  //config:配置对象，对象里面有一个属性很重要，headers请求头
  return config
}, e => Promise.reject(e))

//axios的响应拦截器
service.interceptors.response.use(res => res.data,e =>{
    return Promise.reject(e)
})

export default service