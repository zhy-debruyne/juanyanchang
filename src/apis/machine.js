import axios from "@/axios";
//import request  from "@/utils/request";


//获取设备列表
export function getMachineList(page, pageSize) {
    return axios.get(`/machines`, {
      params: {
        page,
        pageSize
      }
    });
}

//获取设备，不需要分页
export function getMachineData() {
    return axios.get(`/machines/allmachine`);
}

//新增设备
export function addMachine(data){
    return axios.post('/machines',data)
}

//删除设备
export function deleteMachine(id) {
    return axios.delete(`/machines?id=${id}`);
}

//修改设备
export function updateMachine(data) {
    return axios.put('/machines', data);
}

//获取所有设备isConnected  --GET http://localhost:8881/machines/isConnected
export function getAllMachineIsConnected() {
    return axios.get(`/machines/isConnected`);
}