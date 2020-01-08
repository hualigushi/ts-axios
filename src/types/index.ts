export type Method = 'get' | 'GET' // 字符串字面量类型
    | 'delete' | 'DETELE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'

// 请求参数接口类型
export interface AxiosRequestConfig {
    url?: string
    method?: Method // 限制method只能传定义好的字符串，不能传任意的字符串
    data?: any // data 是 post、patch 等类型请求的数据，放到 request body 中的
    params?: any // params 是 get、head 等类型请求的数据，拼接到 url 的 query string 中的
    headers?: any
    responseType?: XMLHttpRequestResponseType  /* 对于一个 AJAX 请求的 response，我们是可以指定它的响应的数据类型的，
                                               通过设置 XMLHttpRequest 对象的 responseType 属性
                                                responseType 的类型是一个 XMLHttpRequestResponseType 类型，
                                                它的定义是 "" | "arraybuffer" | "blob" | "document" | "json" | "text" 字符串字面量类型 */
    timeout?: number
    tranformRequest?: AxiosTransformer | AxiosTransformer[]
    transformResponse?: AxiosTransformer | AxiosTransformer[]
    cancelToken?: CancelToken
    withCredentials?: boolean
    xsrfCookieName?: string
    xsrfHeaderName?: string
    onDownloadProgress?: (e: ProgressEvent) => void
    onUploadProgress?: (e: ProgressEvent) => void
    auth?: AxiosBasicCredentials
    validateStatus?: (status: number) => boolean
    paramsSerializer?: (params: any) => string
    baseURL?: string

    [propName: string]: any // 索引签名
}

/* 服务器端请求的响应res 对象，
服务端返回的数据 data，HTTP 状态码status，状态消息 statusText，响应头 headers、请求配置对象 config 
以及请求的 XMLHttpRequest 对象实例 request */
export interface AxiosResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: any
    config: AxiosRequestConfig
    request: any
}


// axios 函数返回的是一个 Promise 对象，定义一个 AxiosPromise 接口，它继承于 Promise<AxiosResponse> 这个泛型接口
// 当 axios 返回的是 AxiosPromise 类型，那么 resolve 函数中的参数就是一个 AxiosResponse 类型
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {

}

export interface AxiosError extends Error {
    isAxiosError: boolean
    config: AxiosRequestConfig
    code?: string | null
    request?: any
    response?: AxiosResponse
}

export interface Axios {
    defaults: AxiosRequestConfig
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>
        response: AxiosInterceptorManager<AxiosResponse>
    }
    request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>

    get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

    delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

    head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

    options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

    getUri(config?: AxiosRequestConfig): string
}

export interface AxiosInstance extends Axios {
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

    <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosClassStatic {
    new(config: AxiosRequestConfig): Axios
}

export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance

    CancelToken: CancelTokenStatic
    Cancel: CancelStatic
    isCancel: (value: any) => boolean

    all<T>(promises: Array<T | Promise<T>>): Promise<T[]>

    spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

    Axios: AxiosClassStatic
}

export interface AxiosInterceptorManager<T> {
    use(resolve: ResolvedFn<T>, rejected?: RejectedFn): number

    eject(id: number): void
}

export interface ResolvedFn<T> {
    (val: T): T | Promise<T>
}

export interface RejectedFn {
    (error: any): any
}

export interface AxiosTransformer {
    (data: any, headers?: any): any
}

export interface CancelToken {
    promise: Promise<Cancel>
    reason?: Cancel

    throwIfRequested(): void
}

export interface Canceler {
    (message?: string): void
}

export interface CancelExecutor {
    (cancel: Canceler): void
}

export interface CancelTokenSource {
    token: CancelToken
    cancel: Canceler
}

export interface CancelTokenStatic {
    new(executor: CancelExecutor): CancelToken

    source(): CancelTokenSource
}

export interface Cancel {
    message?: string
}

export interface CancelStatic {
    new(message?: string): Cancel
}

export interface AxiosBasicCredentials {
    username: string
    password: string
}
