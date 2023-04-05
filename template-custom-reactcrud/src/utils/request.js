/**
 * 封装的异步请求函数,所有http请求都将经过这里
 * **/
import axios from "axios";
import { token } from "./storage";
import {message} from 'antd'

export const fetchURL = ({url, headers = {"accept": "*/*"}, body = null, method = 'GET'}) => fetch(
  url, {
  headers,
  body,
  method,
}).then(async (response) => {
  return {
    status: response.status,
    data: await response.json()
  }
});

axios.defaults.withCredentials = false;//在跨域请求时，不会携带用户凭证；返回的 response 里也会忽略 cookie

//创建axios实例，请求超时时间为300秒
const http = axios.create({
 timeout: 300000,
});
// 请求拦截器
http.interceptors.request.use((config) => {
  // 中断请求
 const CancelToken = axios.CancelToken;
 const source = CancelToken.source();
 const tokenVal = token.get()
 tokenVal && (config.headers['Authorization'] = tokenVal)
 config.cancelToken = source.token

 return config;
}, (error) => {
 return Promise.reject(error)
})

// 响应拦截
http.interceptors.response.use(response => {
 const {data, success, message:msgText} = response.data
 if (!success) {
   message.error(msgText || '请求出错了');
 }
 return response.data
 }, error => {
   const {status, data} = error.response;
   if (!data.success) {
     message.error(data.message || '请求出错了');
   }
   // if (status === 400 && data?.errors?.[0]?.message === '400 Bad Request: The CSRF token has expired.'){
   //   message.error('登录过期，请重新登录')
   //   window.location.href = "/register";
   // }
   // if (status === 401) {
   //   window.location.href = "/register";
   // }
   // if (status === 403) {
   //   message.error("暂无权限，请联系管理员分配权限");
   //   // window.location.href = "/exception/403";
   // } 
   return data;
})

export default {
 get(url,data){
   return http.get(url,{params:data})
 },
 post(url,data, config){
   return http.post(url, data, config)	
 },
 delete(url, data, config) {
   return http.delete(url,data, config)	
 },
 put(url, data, config) {
   return http.put(url,data, config)	
 }
} 
