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
    timeout?: number// 请求默认的超时时间是 0，即永不超时。所以我们首先需要允许程序可以配置超时时间
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

/* 响应数据支持泛型

interface ResponseData<T = any> {
  code: number
  result: T
  message: string
}

interface User {
  name: string
  age: number
}

function getUser<T>() {
  return axios<ResponseData<T>>('/extend/user')
    .then(res => res.data)
    .catch(err => console.error(err))
}


async function test() {
  const user = await getUser<User>()
  if (user) {
    console.log(user.result.name)
  }
}

test()

服务器端返回
router.get('/extend/user', function (req, res) {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: 'jack',
        age: 18
      }
    })
  })
当我们调用 getUser<User> 的时候，相当于调用了 axios<ResponseData<User>>，
也就是我们传入给 axios 函数的类型 T 为 ResponseData<User>；
相当于返回值 AxiosPromise<T> 的 T，
实际上也是 Promise<AxiosResponse<T>> 中的 T 的类型是 ResponseData<User>，
所以响应数据中的 data 类型就是 ResponseData<User>，也就是如下数据结构：
{
  code: number
  result: User
  message: string
}
这个也是 const user = await getUser<User>() 返回值 user 的数据类型，所以 TypeScript 能正确推断出 user 的类型。


AxiosResponse 接口添加了泛型参数 T，T=any 表示泛型的类型参数默认值为 any */

export interface AxiosResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: any
    config: AxiosRequestConfig
    request: any
}


/* axios 函数返回的是一个 Promise 对象，定义一个 AxiosPromise 接口，它继承于 Promise<AxiosResponse> 这个泛型接口
当 axios 返回的是 AxiosPromise 类型，那么 resolve 函数中的参数就是一个 AxiosResponse 类型 */

/* 请求的返回类型都变成了 AxiosPromise<T>，也就是 Promise<AxiosResponse<T>>，
这样我们就可以从响应中拿到了类型 T 了 */
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {

}

export interface AxiosError extends Error {
    isAxiosError: boolean
    config: AxiosRequestConfig
    code?: string | null
    request?: any
    response?: AxiosResponse
}

/* 定义一个 Axios 类型接口，它描述了 Axios 类中的公共方法
axios.request(config)

axios.get(url[, config])

axios.delete(url[, config])

axios.head(url[, config])

axios.options(url[, config])

axios.post(url[, data[, config]])

axios.put(url[, data[, config]])

axios.patch(url[, data[, config]]) */
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

// 定义了 AxiosInstance ,包括两个函数方法，接口继承 Axios，是一个混合类型的接口
export interface AxiosInstance extends Axios {
    /* 函数重载
    只支持传入 1 个参数
    axios({
        url: '/extend/post',
        method: 'post',
        data: {
          msg: 'hi'
        }
      })

      支持传入 2 个参数
      axios('/extend/post', {
        method: 'post',
        data: {
          msg: 'hello'
        }
      }) */
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

    <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosClassStatic {
    new(config: AxiosRequestConfig): Axios
}

// 扩展静态接口
export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance

    CancelToken: CancelTokenStatic
    Cancel: CancelStatic
    isCancel: (value: any) => boolean

    all<T>(promises: Array<T | Promise<T>>): Promise<T[]>

    spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R

    Axios: AxiosClassStatic
}

// 拦截器管理对象对外的接口
export interface AxiosInterceptorManager<T> {
    /* use 方法支持 2 个参数，第一个是 resolve 函数，
    第二个是 reject 函数，对于 resolve 函数的参数，
    请求拦截器是 AxiosRequestConfig 类型的，
    而响应拦截器是 AxiosResponse 类型的；
    而对于 reject 函数的参数类型则是 any 类型的。 */
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

// CancelToken 是实例类型的接口定义
export interface CancelToken {
    promise: Promise<Cancel>
    reason?: Cancel

    throwIfRequested(): void
}
// Canceler 是取消方法的接口定义
export interface Canceler {
    (message?: string): void
}

// CancelExecutor 是 CancelToken 类构造函数参数的接口定义
export interface CancelExecutor {
    (cancel: Canceler): void
}
// CancelTokenSource 作为 CancelToken 类静态方法 source 函数的返回值类型
export interface CancelTokenSource {
    token: CancelToken
    cancel: Canceler
}
// CancelTokenStatic 则作为 CancelToken 类的类类型
export interface CancelTokenStatic {
    new(executor: CancelExecutor): CancelToken

    source(): CancelTokenSource
}
// Cancel 是实例类型的接口定义
export interface Cancel {
    message?: string
}
// CancelStatic 是类类型的接口定义
export interface CancelStatic {
    new(message?: string): Cancel
}

export interface AxiosBasicCredentials {
    username: string
    password: string
}
