import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 Axios 实例
const myAxios = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: '/api/',
  timeout: 60000,
  withCredentials: true, // 携带 cookie
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data, config } = response
    const silentError = Boolean(config?.silentError)

    if (!silentError && data.code !== 40100 && data.code !== 0) {
      ElMessage.error(data.msg || '请求失败')
    }

    return response
  },
  function (error) {
    if (!error?.config?.silentError) {
      ElMessage.error(error?.message || '请求失败')
    }

    return Promise.reject(error)
  },
)

export default myAxios
