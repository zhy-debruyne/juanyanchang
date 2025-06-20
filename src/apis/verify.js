import axios from "@/axios";

//分页查询验证结果  --GET http://localhost:8881/verify/page?page=1&pageSize=10
export function getVerifyList(page, pageSize) {
  return axios.get(`/verify/page`, {
    params: {
      page,
      pageSize
    }
  });
}

//获取最新的验证结果  --GET http://localhost:8881/verify/newest
export function getNewestVerify() {
  return axios.get(`/verify/newest`);
}

//根据id获取验证结果细节  --GET http://localhost:8881/verify/detail?id=1
export function getVerifyDetail(id) {
  return axios.get(`/verify/detail`, {
    params: {
      id
    }
  });
}