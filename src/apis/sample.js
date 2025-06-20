import axios from "@/axios";
//import service from "@/axios";
//import service from '@/utils/request';

//获取数字样列表
// export function getSampleList(page, pageSize){
//     return axios.get('/samples/sample', {
//         params: {
//             page,
//             pageSize,
//         },
//     });
// }

// 获取备选数字样列表
// export function getSamplebList(page, pageSize){
//     return axios.get('/samples/sampleb', {
//         params: {
//             page,
//             pageSize,
//         },
//     });
// }

// //获取设备源数字样列表
// export function getSamplemList(page, pageSize){
//     return axios.get('/samples/samplem', {
//         params: {
//             page,
//             pageSize,
//         },
//     });
// }
// //获取设备源正常图片列表
// export function getSamplenList(page, pageSize){
//     return axios.get('/samples/samplen', {
//         params: {
//             page,
//             pageSize,
//         },
//     });
// }

//删除数字样
export function deleteSample(id){
    return axios.delete(`/samples?sampleID=${id}`);
}

//修改备选数字样缺陷等级
export function updateSampleb(data){
    return axios.put('/samples/sampleb', data);
}

//导入到下发数字样库
export function addSample(data){
    return axios.put('/samples/sample', data);
}

//导出到备选数字样库
export function addSampleb(data){
    return axios.put('/samples/outsample', data);
}


//从数字样库中获取所有不同的品牌名称、缺陷名称和缺陷等级
export function getallnames(){
    return axios.get('/samples/sample/names');
}
// 普通样本筛选接口（isCandidate=0）
export function getSampleList(page, pageSize, brands, defects, grades){
    return axios.get('/samples/sample/filter', {
        params: {
            page,
            pageSize,
            brands: brands.length ? brands : undefined,
            defects: defects.length ? defects : undefined,
            grades: grades.length ? grades : undefined
        },
    });
}

//从备选数字样库中获取所有不同的品牌名称、缺陷名称、缺陷等级和推荐指数
export function getallnamesb(){
    return axios.get('/samples/sampleb/names');
}
// 备选样本筛选接口（isCandidate=1）
export function getSamplebList(page, pageSize, brands, defects, grades,nps){
    return axios.get('/samples/sampleb/filter', {
        params: {
            page,
            pageSize,
            brands: brands.length ? brands : undefined,
            defects: defects.length ? defects : undefined,
            grades: grades.length ? grades : undefined,
            nps: nps.length ? nps : undefined
        },
    });
}

//获取设备源图库所有不同设备id，品牌和缺陷类型 - GET http://localhost:8881/samples/samplem/names
export function getallnamesm(){
    return axios.get('/samples/samplem/names');
}
//获取正常图片所有设备id，品牌名称 - GET  http://localhost:8881/samples/samplen/names
export function getallnamesn(){
    return axios.get('/samples/samplen/names');
}
//分页筛选设备源图片 -GET  http://localhost:8881/samples/samplem/filter?page=1&pageSize=10&machineIDs=xxx&brands=xxx&defects=xxx&start=xxx&end=xxx
export function getSamplemList(page, pageSize, machineIDs,brands, defects, start, end){ 
    return axios.get('/samples/samplem/filter', {
        params: {
            page,
            pageSize,
            machineIDs: machineIDs.length ? machineIDs : undefined,
            brands: brands.length ? brands : undefined,
            defects: defects.length ? defects : undefined,
            start: start ? start : undefined,
            end: end ? end : undefined
        },
    });
}
//分页筛选正常图片 -GET http://localhost:8881/samples/samplen/filter?page=1&pageSize=10&machineIDs=xxx&brands=xxx&start=xxx&end=xxx
export function getSamplenList(page, pageSize, machineIDs,brands, start, end){ 
    return axios.get('/samples/samplen/filter', {
        params: {
            page,
            pageSize,
            machineIDs: machineIDs.length ? machineIDs : undefined,
            brands: brands.length ? brands : undefined,
            start: start ? start : undefined,
            end: end ? end : undefined
        },
    });
}