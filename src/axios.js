import axios from "axios";
// 在axios配置文件中（通常位于src/axios.js）
import qs from 'qs';

const service = axios.create({
  //baseURL: "http://192.168.0.110:8881/",
  baseURL: "http://localhost:8881/",
  //baseURL: "http://192.168.0.106:8881/",
  //baseURL: "http://192.168.0.108:8881/",
  timeout: 10000,
  paramsSerializer: params => qs.stringify(params, {
    arrayFormat: 'repeat', // 关键配置，处理数组参数
    skipNulls: true       // 可选：过滤空值
  })
});



export default service;