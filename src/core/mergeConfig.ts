import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'

const strats = Object.create(null)

// 如果有 val2 则返回 val2，否则返回 val1，
// 也就是如果自定义配置中定义了某个属性，就采用自定义的，
// 否则就用默认配置。
function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1
}

// 对于 url、params、data 这些属性，默认配置显然是没有意义的，
// 它们是和每个请求强相关的，所以我们只从自定义配置中获取。
function fromVal2Strat(val1: any, val2: any): any {
    if (typeof val2 !== 'undefined') {
        return val2
    }
}

/* 对于 headers 这类的复杂对象属性，我们需要使用深拷贝的方式，
同时也处理了其它一些情况，因为它们也可能是一个非对象的普通值。
未来我们讲到认证授权的时候，auth 属性也是这个合并策略。 */
function deepMergeStrat(val1: any, val2: any): any {
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2)
    } else if (typeof val2 !== 'undefined') {
        return val2
    } else if (isPlainObject(val1)) {
        return deepMerge(val1)
    } else if (typeof val1 !== 'undefined') {
        return val1
    }
}

const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat
})

const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach(key => {
    strats[key] = deepMergeStrat
})

/* 合并方法的整体思路就是对 config1 和 config2 中的属性遍历，
执行 mergeField 方法做合并，
这里 config1 代表默认配置，config2 代表自定义配置。
遍历过程中，我们会通过 config2[key] 这种索引的方式访问，
所以需要给 AxiosRequestConfig 的接口定义添加一个字符串索引签名：
[propName: string]: any
*/
export default function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig): AxiosRequestConfig {
    if (!config2) {
        config2 = {}
    }

    const config = Object.create(null)

    for (let key in config2) {
        mergeField(key)
    }

    for (let key in config1) {
        if (!config2[key]) {
            mergeField(key)
        }

    }

    function mergeField(key: string): void {
        const strat = strats[key] || defaultStrat
        config[key] = strat(config1[key], config2![key])
    }
    return config
}
