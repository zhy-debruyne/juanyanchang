import axios from "@/axios";

//获取品牌列表
export function getBrandList(page, pageSize) {
    return axios.get(`/brands`, {
      params: {
        page,
        pageSize
      }
    });
  }



//新增品牌
export function addBrand(data){
    return axios.post('/brands',data)
}

//删除品牌
export function deleteBrand(id){
    return axios.delete(`/brands?brandID=${id}`)
}

//修改品牌
export function updateBrand(data){
    return axios.put(`/brands`,data)
}

//获取品牌名称
export function getBrandName(){
    return axios.get(`/brands/allnames`)
}
