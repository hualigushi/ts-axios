import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
    protocol: string
    host: string
}

function encode(val: string): string {
    return encodeURIComponent(val)
        .replace(/%40/g, '@') // 特殊字符不需要编码
        .replace(/%3A/g, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/ig, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/ig, '[')
        .replace(/%5D/ig, ']')
}

export function buildURL(url: string, params?: any， paramsSerializer?: (params: any) => string): string {
    if (!params) {
        return url
    }

    let serializedParams

    if (paramsSerializer) {
        serializedParams = paramsSerializer(params)
    } else if (isURLSearchParams (params)) {
   serializedParams = params.toString()
    }else {
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
