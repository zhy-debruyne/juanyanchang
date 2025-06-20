import axios from "@/axios";

//获取普通用户列表
export function getUserList(page, pageSize) {
  return axios.get(`/users`, {
    params: {
      page,
      pageSize
    }
  });
}

//获取所有普通员工名字
export function getUserNameList() {
  return axios.get(`/users/username`);
}

//新增普通用户
export function addUser(data) {
  return axios.post(`/users`, data);
}

//删除普通用户
export function deleteUser(id) {
  return axios.delete(`/users?userID=${id}`);
}

//修改普通用户
export function updateUser(data) {
  return axios.put(`/users`, data);
}