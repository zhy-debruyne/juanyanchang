// import axios from 'axios';

// // 登录接口（参数应为用户名和密码字符串）
// export function login(userName, userPassword) {
//   const url = 'http://192.168.0.110:8881/login'; // 完整 URL（或使用 baseURL）
//   const requestBody = {
//     userName: userName, // 明确键值对（避免歧义）
//     userPassword: userPassword,
//   };

//   return axios.post(url, requestBody)
//     .then(response => {
//       // 假设后端返回的是直接包含 token 的字符串（如示例中的 JWT）
//       return response.data; // 若后端返回 { token: 'xxx' }，则改为 response.data.token
//     })
//     .catch(error => {
//       console.error('登录请求失败:', error);
//       throw error.response || error; // 抛出错误供上层处理
//     });
// }

import axios from "@/axios"; // 确保路径指向你的axios实例文件

export function login(userName, userPassword) {
  return axios.post('/login', {  // 使用相对路径
    userName,      // ES6对象属性简写语法
    userPassword
  })
  .then(response => {
    
    return response.data; // 返回token数据
    
  })
  .catch(error => {
    console.error('登录请求失败:', error);
    // 标准化错误抛出 (优先使用服务器返回的错误信息)
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '网络连接异常'
    );
  });
}