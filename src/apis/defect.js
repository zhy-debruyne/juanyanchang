import axios from "@/axios";

//获取缺陷种类列表
export function getDefectList(page, pageSize) {
  return axios.get('/defects/nomachine', {
    params: {
      page,
      pageSize,
    },
  });
}

//获取设备源缺陷种类列表
export function getmDefectList(page, pageSize) {
    return axios.get('/defects/ismachine', {
      params: {
        page,
        pageSize,
      },
    });
  }

//新增缺陷种类
export function addDefect(data) {
  return axios.post('/defects', data);
}

//删除缺陷种类
export function deleteDefect(id) {
  return axios.delete(`/defects?defectID=${id}`)
}

//修改缺陷种类
export function updateDefect(data) {
  return axios.put('/defects', data);
}

//获取所有缺陷种类名称
export function getDefectName() {
  return axios.get('/defects/allnames');
}

//获取所有设备源缺陷种类名称
export function getmDefectName() {
    return axios.get('/defects/allmachinenames');
  }