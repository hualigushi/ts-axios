export type Method = 'get' | 'GET' 
| 'delete' | 'DETELE'
| 'head' | 'HEAD'
| 'options' | 'OPTIONS'
| 'post' | 'POST'
| 'put' | 'PUT'
| 'patch' | 'PATCH'

export interface AxiosRequestConfig {
    url: string
    method?: Method
    data?: any
    params?: any
    headers?: any
    responseType?: XMLHttpRequestResponseType
}

export interface AxiosResponse {
    data: any
    status: any
    statusText: string
    header: any
    config: AxiosRequestConfig
    request: any
}

export interface AxiosPromise extends Promise<AxiosResponse> {

}
