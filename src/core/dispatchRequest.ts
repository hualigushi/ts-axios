import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import { transform } from './transform'

export default function despatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
    processConfig(config) // 处理config
    return xhr(config).then((res) => {
        return transformResponseData(res)
    })
}

function processConfig(config: AxiosRequestConfig): void {
    config.url = transformURL(config) // 处理url
    config.data = transform(config.data, config.headers, config.transformRequest)
   config.headers = flattenHeaders(config.headers, config.method!)
}

function transformURL(config: AxiosRequestConfig): string {
    const { url, params } = config
    return buildURL(url!, params) // ! 类型断言，不为空
}
function transformResponseData(res: AxiosResponse): AxiosResponse {
    res.data = transform(res.data, res.headers, res.config.transfromResponse)
    return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
   if (config.cancelToken) {
     config.cancelToken.throwIfRequested()
       }
}
