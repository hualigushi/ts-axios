import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import xhr from './xhr'
import { buildURL } from './helpers/url'
import { transformRequest, transformResponse } from './helpers/data'
import { processHeaders } from './helpers/headers'

function axios(config: AxiosRequestConfig): AxiosPromise {
    processConfig(config) // 处理config
    return xhr(config).then((res) => {
        return transformResponseData(res)
    })
}

function processConfig(config: AxiosRequestConfig): void {
    config.url = transformURL(config) // 处理url
    config.headers = transformHeaders(config)
    config.data = transfromRequestData(config) // 处理data,序列化data对象
}

function transformURL(config: AxiosRequestConfig): string {
    const { url, params } = config
    return buildURL(url, params)
}
function transfromRequestData(config: AxiosRequestConfig): any {
    return transformRequest(config.data)
}
function transformHeaders(config: AxiosRequestConfig): any {
    const { headers = {}, data } = config
    return processHeaders(headers, data)
}
function transformResponseData(res: AxiosResponse): AxiosResponse {
    res.data = transformResponse(res.data)
    return res
}
export default axios