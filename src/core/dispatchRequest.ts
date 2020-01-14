import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config) // 处理config
  return xhr(config).then(res => {
    return transformResponseData(res)
  },
    e => { // 对异常情况的响应数据做转换
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    })
}

function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config) // 处理url
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  /* const fakeConfig = {
    baseURL: 'https://www.baidu.com/',
    url: '/user/12345',
    params: {
      idClient: 1,
      idTest: 2,
      testString: 'thisIsATest'
    }
  }
  console.log(axios.getUri(fakeConfig))
  // https://www.baidu.com/user/12345?idClient=1&idTest=2&testString=thisIsATest */
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer) // ! 类型定义中url是可选参数，但是运行到这里，可以确定url参数不为空，所以使用类型断言
}
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

/* 发送请求前检查一下配置的 cancelToken 是否已经使用过了，
如果已经被用过则不用法请求，直接抛异常 */
function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
