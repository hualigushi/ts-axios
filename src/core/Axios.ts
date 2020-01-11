import { AxiosPromise, AxiosRequestConfig, Method, AxiosResponse, ResolvedFn, RejectedFn } from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

/* Interceptors 类型拥有 2 个属性，一个请求拦截器管理类实例，
一个是响应拦截器管理类实例。
我们在实例化 Axios 类的时候，
在它的构造器去初始化这个 interceptors 实例属性。 */
interface Interceptors {
    request: InterceptorManager<AxiosRequestConfig>
    response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
    resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
    rejected?: RejectedFn
}
export default class Axios {
    defaults: AxiosRequestConfig // 给 axios 对象添加一个 defaults 属性，表示默认配置
    interceptors: Interceptors
    
    // Axios 的构造函数接受一个 initConfig 对象，把 initConfig 赋值给 this.defaults。
    constructor(initConfig: AxiosRequestConfig) {
        this.defaults = initConfig
        this.interceptors = {
            request: new InterceptorManager<AxiosRequestConfig>(),
            response: new InterceptorManager<AxiosResponse>()
        }
    }

    request(url: any, config?: any): AxiosPromise {
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
        })
        
        我们把 request 函数的参数改成 2 个，
        url 和 config 都是 any 类型，
        config 还是可选参数。
        接着在函数体我们判断 url 是否为字符串类型，一旦它为字符串类型，
        则继续对 config 判断，因为它可能不传，如果为空则构造一个空对象，
        然后把 url 添加到 config.url 中。如果 url 不是字符串类型，
        则说明我们传入的就是单个参数，且 url 就是 config，因此把 url 赋值给 config。
        这里要注意的是，我们虽然修改了 request 的实现，支持了 2 种参数，
        但是我们对外提供的 request 接口仍然不变，可以理解为这仅仅是内部的实现的修改，
        与对外接口不必一致，只要保留实现兼容接口即可。
        */
        if (typeof url === 'string') {
            if (!config) {
                config = {}
            }
            config.url = url
        } else {
            config = url
        }
        config = mergeConfig(this.defaults, config)
        

        /* 拦截器链式调用
        首先，构造一个 PromiseChain 类型的数组 chain，并把 dispatchRequest 函数赋值给 resolved 属性；
        接着先遍历请求拦截器插入到 chain 的前面；然后再遍历响应拦截器插入到 chain 后面。
        接下来定义一个已经 resolve 的 promise，循环这个 chain，拿到每个拦截器对象，
        把它们的 resolved 函数和 rejected 函数添加到 promise.then 的参数中，
        这样就相当于通过 Promise 的链式调用方式，实现了拦截器一层层的链式调用的效果。

        注意我们拦截器的执行顺序，对于请求拦截器，先执行后添加的，再执行先添加的；
        而对于响应拦截器，先执行先添加的，后执行后添加的。
        */
        const chain: PromiseChain<any>[] = [{
            resolved: dispatchRequest,
            rejected: undefined
        }]
        
        this.interceptors.request.forEach(interceptor => {
            chain.unshift(interceptor)
        })

        this.interceptors.response.forEach(interceptor => {
            chain.push(interceptor)
        })
        // Promise 成功后会往下传递参数，于是这里先传入合并后的参数，供之后的拦截器使用 
        let promise = Promise.resolve(config)
        
        while (chain.length) {
            const { resolved, rejected } = chain.shift()! // 类型断言
            promise = promise.then(resolved, rejected)
        }

        return promise
    }
    
    // 对于 get、delete、head、options、post、patch、put 这些方法，都是对外提供的语法糖，
    // 内部都是通过调用 request 方法实现发送请求，只不过在调用之前对 config 做了一层合并处理
    get(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('get', url, config)
    }

    delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('delete', url, config)
    }

    head(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('head', url, config)
    }

    options(url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithoutData('options', url, config)
    }

    post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('post', url, data, config)
    }

    put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('put', url, data, config)
    }

    patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this._requestMethodWithData('patch', url, data, config)
    }

    getUri(config?: AxiosRequestConfig): string {
        config = mergeConfig(this.defaults, config)
        return transformURL(config)
    }

    _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method,
            url
        }))
    }

    _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
        return this.request(Object.assign(config || {}, {
            method,
            url,
            data
        }))
    }
}
