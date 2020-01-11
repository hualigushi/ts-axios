import { AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

/* 在 createInstance 工厂函数的内部，我们首先实例化了 Axios 实例 context，
接着创建instance 指向 Axios.prototype.request 方法，并绑定了上下文 context；
接着通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，
这样就实现了一个混合对象：instance 本身是一个函数，又拥有了 Axios 类的所有原型和实例属性，
最终把这个 instance 返回。由于这里 TypeScript 不能正确推断 instance 的类型，
我们把它断言成 AxiosInstance 类型。

这样我们就可以通过 createInstance 工厂函数创建了 axios，
当直接调用 axios 方法就相当于执行了 Axios 类的 request 方法发送请求，
当然我们也可以调用 axios.get、axios.post 等方法。 */
function createInstance(config: AxiosRequestConfig): AxiosStatic {
    const context = new Axios(config)

    // 这样instance就指向了request方法，且上下文指向context，所以可以直接以 instance(option) 方式调用 
    // Axios.prototype.request 内对第一个参数的数据类型判断，使我们能够以 instance(url, option) 方式调用
    const instance = Axios.prototype.request.bind(context)

    // 把context对象上的自身属性和方法扩展到instance上
    // 这样 instance 就有了 get、post、put等方法
    // 并指定上下文为context，这样执行Axios原型链上的方法时，this会指向context
    extend(instance, context)

    return instance as AxiosStatic
}

// 可以在执行 createInstance 创建 axios 对象的时候，把默认配置传入了
const axios = createInstance(defaults)

//  axios.create 的静态接口允许我们创建一个新的 axios 实例，
// 同时允许我们传入新的配置和默认配置合并，并做为新的默认配置
axios.create = function create(config: AxiosRequestConfig): AxiosStatic {
    return createInstance(mergeConfig(defaults, config))
}
axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

// axios.all 就是 Promise.all 的封装，它返回的是一个 Promise 数组
axios.all = function all(promises) {
    return Promise.all(promises)
}
//  axios.spread 方法是接收一个函数，返回一个新的函数，新函数的结构满足 then 函数的参数结构
axios.spread = function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr)
    }
}

axios.Axios = Axios

// 整个库入口
export default axios
