import { AxiosRequestConfig } from './types'
import { processHeaders } from './helpers/headers'
import { transformRequest, transformResponse } from './helpers/data'

const defaults: AxiosRequestConfig = {
    method: 'get',
    timeout: 0,

    /* headers 的默认配置支持 common 和一些请求 method 字段，
    common 表示对于任何类型的请求都要添加该属性，
    而 method 表示只有该类型请求方法才会添加对应的属性。 */
    headers: {
        common: {
            Accept: 'application/json, text/plain, */*'
        }
    },

    xsrfCookieName: 'XSRF-TOKEN', // xsrfCookieName 表示存储 token 的 cookie 名称

    xsrfHeaderName: 'X-XSRF-TOKEN', // xsrfHeaderName 表示请求 headers 中 token 对应的 header 名称

    /*  请求和响应配置化
     官方的 axios 库 给默认配置添加了 transformRequest 和 transformResponse 两个字段，它们的值是一个数组或者是一个函数。
    其中 transformRequest 允许你在将请求数据发送到服务器之前对其进行修改，这只适用于请求方法 put、post 和 patch，如果值是数组，则数组中的最后一个函数必须返回一个字符串或 FormData、URLSearchParams、Blob 等类型作为 xhr.send 方法的参数，而且在 transform 过程中可以修改 headers 对象。
    而 transformResponse 允许你在把响应数据传递给 then 或者 catch 之前对它们进行修改。
    当值为数组的时候，数组的每一个函数都是一个转换函数，数组中的函数就像管道一样依次执行，前者的输出作为后者的输入。
    axios({
        transformRequest: [(function(data) {
        return qs.stringify(data)
        }), ...axios.defaults.transformRequest],
        transformResponse: [axios.defaults.transformResponse, function(data) {
        if (typeof data === 'object') {
            data.b = 2
        }
        return data
        }],
        url: '/config/post',
        method: 'post',
        data: {
        a: 1
        }
    } */
    transformRequest: [
        function (data: any, headers: any): any {
            processHeaders(headers, data)
            return transformRequest(data)
        }
    ],

    transformResponse: [
        function (data: any): any {
            return transformResponse(data)
        }
    ],

    validateStatus(status: number): boolean {
        return status >= 200 && status < 300 // 对于一个正常的请求，往往会返回 200-300 之间的 HTTP 状态码
    }
}

const methodsNoData = ['delete', 'get', 'head', 'options']

methodsNoData.forEach(method => {
    defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
    defaults.headers[method] = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

export default defaults
