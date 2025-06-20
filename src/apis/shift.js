import axios from "@/axios";

//分页查询班次 -GET http://localhost:8881/shifts?page=1&pageSize=10
export function getShiftList(page, pageSize) {
  return axios.get(`/shifts`, {
    params: {
      page,
      pageSize
    }
  });
}

//新增
export function addShift(data) {
  return axios.post(`/shifts`, data);
}

//删除
export function deleteShift(id) {
  return axios.delete(`/shifts?ID=${id}`);
}

//修改
export function updateShift(data) {
  return axios.put(`/shifts`, data);
}