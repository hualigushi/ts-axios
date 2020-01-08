import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
    protocol: string
    host: string
}

function encode(val: string): string {
    return encodeURIComponent(val)
        .replace(/%40/g, '@') // 编码后特殊字符再转化回来
        .replace(/%3A/g, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/ig, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/ig, '[')
        .replace(/%5D/ig, ']')
}


/*** 
 axios({
  method: 'get',
  url: '/base/get',
  params: {
    a: 1,
    b: 2
  }
})
/base/get?a=1&b=2


参数值为数组
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})
/base/get?foo[]=bar&foo[]=baz


参数值为对象
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})
/base/get?foo=%7B%22bar%22:%22baz%22%7D
foo后面拼接的是 {"bar":"baz"} encode 后的结果


参数值为 Date 类型
const date = new Date()
axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})
/base/get?date=2019-04-01T05:55:39.030Z
date后面拼接的是 date.toISOString() 的结果


特殊字符支持
对于字符 `@`、`:`、`$`、`,`、` `、`[`、`]`，是允许出现在 `url` 中的，不希望被 encode
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@:$, '
  }
})
/base/get?foo=@:$+
注意，我们会把空格 ` ` 转换成 `+`


空值忽略
对于值为 `null` 或者 `undefined` 的属性，我们是不会添加到 url 参数中的
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})
/base/get?foo=bar


丢弃 url 中的哈希标记
axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})
/base/get?foo=bar


保留 url 中已存在的参数
axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
/base/get?foo=bar&bar=baz
***/
export function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string): string {
    if (!params) {
        return url
    }

    let serializedParams

    if (paramsSerializer) {
        serializedParams = paramsSerializer(params)
    } else if (isURLSearchParams(params)) {
        serializedParams = params.toString()
    } else {
        const parts: string[] = []

        Object.keys(params).forEach((key) => {
            const val = params[key]
            if (val === null || typeof val === 'undefined') {
                return
            }
            let values = []
            if (Array.isArray(val)) {
                values = val
                key += '[]'
            } else {
                values = [val]
            }
            values.forEach((val) => {
                if (isDate(val)) {
                    val = val.toISOString()
                } else if (isPlainObject(val)) {
                    val = JSON.stringify(val)
                }
                parts.push(`${encode(key)}=${encode(val)}`)
            })
        })

        serializedParams = parts.join('&')
    }

    if (serializedParams) {
        const markIndex = url.indexOf('#') // url中如果有#,则#后面的字符忽略
        if (markIndex !== -1) {
            url = url.slice(0, markIndex)
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams // 判断原来的url是否已经带有参数

    }
    return url
}

export function isAbsoluteURL(url: string): boolean {
    return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

export function combineURL(baseURL: string, relativeURL?: string): string {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

export function isURLSameOrigin(requestURL: string): boolean {
    const parsedOrgin = resolveURL(requestURL)
    return (parsedOrgin.protocol === currentOrigin.protocol &&
        parsedOrgin.host === currentOrigin.host)
}

const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL(url: string): URLOrigin {
    urlParsingNode.setAttribute('href', url)
    const { protocol, host } = urlParsingNode
    return {
        protocol,
        host
    }
}
