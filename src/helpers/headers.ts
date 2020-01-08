import { isPlainObject, deepMerge } from './util'
import { Method } from '../types'

// 请求 header 属性是大小写不敏感的，规范化content-type 为 Content-Type
/* axios({
    method: 'post',
    url: '/base/post',
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    data: {
      a: 1,
      b: 2
    }
  }) */
function normalizeHeaderName(headers: any, normalizeName: string): void {
    if (!headers) {
        return
    }
    Object.keys(headers).forEach((name) => {
        if (name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()) {
            headers[normalizeName] = headers[name]
            delete headers[name]
        }
    })
}

// 当我们传入的 data 为普通对象的时候，headers 如果没有配置 Content-Type 属性，
// 需要自动设置请求 header 的 Content-Type 字段为：application/json;charset=utf-8
export function processHeaders(headers: any, data: any): any {
    normalizeHeaderName(headers, 'Content-Type')

    if (isPlainObject(data)) {
        if (headers && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json;charset=utf-8'
        }
    }

    return headers
}

export function parseHeaders(headers: string): any {
    let parsed = Object.create(null)
    if (!headers) {
        return parsed
    }

    headers.split('\r\n').forEach((line) => {
        let [key, val] = line.split(':')
        key = key.trim().toLowerCase()
        if (!key) {
            return
        }
        if (val) {
            val = val.trim()
        }
        parsed[key] = val
    })

    return parsed
}

export function flattenHeaders(headers: any, method: Method): any {
    if (!headers) {
        return headers
    }
    headers = deepMerge(headers.common, headers[method], headers)
    const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

    methodsToDelete.forEach(method => {
        delete headers[method]
    })

    return headers
}
