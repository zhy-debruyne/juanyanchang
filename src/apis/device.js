//import axios from 'axios';
import axios from "@/axios";

//获取设备信息（不需要分页）
// export function fetchDeviceData() {
//     return axios.get("http://192.168.0.110:8881/device/data");
// }
export function fetchDeviceData() {
  return axios.get("/device/data");
}

//获取设备信息（需要分页）
export function getDeviceList(page, pageSize) {
    return axios.get(`/device/datas`, {
      params: {
        page,
        pageSize
      }
    });
  }

