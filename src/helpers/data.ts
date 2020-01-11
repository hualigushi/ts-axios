import { isPlainObject } from './util'

/***
 * axios({
    method: 'post',
    url: '/base/post',
    data: { 
        a: 1,
        b: 2 
    }
    })
data是不能直接传给 send 函数的，我们需要把它转换成 JSON 字符串
 */
export function transformRequest (data: any): any {
    if (isPlainObject(data)) {
        return JSON.stringify(data)
    }
    return data
}

/* 不去设置 responseType 的情况下，当服务端返回给我们的数据是字符串类型，我们可以尝试去把它转换成一个 JSON 对象
data: "{"a":1,"b":2}"
data: {
    a: 1,
    b: 2
  } */
export function transformResponse (data: any): any {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data)
        } catch (e) {
            // do nothing
        }
    }
    return data
}