declare module '@/request' {
  import type { AxiosRequestConfig, AxiosResponse } from 'axios'

  export interface RequestConfig<D = any> extends AxiosRequestConfig<D> {
    silentError?: boolean
  }

  export interface RequestInstance {
    <T = any, D = any>(url: string, config?: RequestConfig<D>): Promise<AxiosResponse<T, D>>
  }

  const request: RequestInstance
  export default request
}
