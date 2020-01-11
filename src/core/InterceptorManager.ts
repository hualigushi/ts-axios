import { ResolvedFn, RejectedFn } from '../types'

interface Interceptor<T> {
    resolved: ResolvedFn<T>
    rejected?: RejectedFn
}

/* 定义了一个 InterceptorManager 泛型类，
内部维护了一个私有属性 interceptors，
它是一个数组，用来存储拦截器。
该类还对外提供了 3 个方法，
其中 use 接口就是添加拦截器到 interceptors 中，
并返回一个 id 用于删除；
forEach 接口就是遍历 interceptors 用的，
它支持传入一个函数，遍历过程中会调用该函数，
并把每一个 interceptor 作为该函数的参数传入；
eject 就是删除一个拦截器，通过传入拦截器的 id 删除。

// 添加一个请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前可以做一些事情
  return config;
}, function (error) {
  // 处理请求错误
  return Promise.reject(error);
});
// 添加一个响应拦截器
axios.interceptors.response.use(function (response) {
  // 处理响应数据
  return response;
}, function (error) {
  // 处理响应错误
  return Promise.reject(error);
});

axios.interceptors.request.use(config => {
  config.headers.test += '1'
  return config
})
axios.interceptors.request.use(config => {
  config.headers.test += '2'
  return config
})


const myInterceptor = axios.interceptors.request.use(function () { })
axios.interceptors.request.eject(myInterceptor)
*/
export default class InterceptorManager<T> {
    private interceptors: Array<Interceptor<T> | null>

    constructor() {
        this.interceptors = []
    }

    use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
        this.interceptors.push({
            resolved,
            rejected
        })

        return this.interceptors.length - 1
    }

    forEach (fn: (interceptor: Interceptor<T> )=> void):void {
        this.interceptors.forEach(interceptor => {
            if (interceptor !== null) {
                fn(interceptor)
            }
        })
    }

    eject(id: number): void {
        if (this.interceptors[id]) {
            this.interceptors[id] = null
        }
    }
}