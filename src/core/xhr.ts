import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

// 请求逻辑
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => { // 返回Promise
        const {
            data = null,
            url,
            method = 'get', // 默认值
            headers,
            responseType,
            timeout,
            cancelToken,
            withCredentials,
            xsrfHeaderName,
            xsrfCookieName,
            onDownloadProgress,
            onUploadProgress,
            auth,
            validateStatus
        } = config // 通过解构赋值的语法从 config 中拿到对应的属性值赋值给变量
        
        const request = new XMLHttpRequest()

        request.open(method.toUpperCase(), url!, true)

        configureRequest()

        addEvents()

        processHeaders()

        processCancel()

        request.send(data)

        function configureRequest(): void {
            if (responseType) {
                request.responseType = responseType // 返回数据类型设置
            }

            if (timeout) {
                request.timeout = timeout
            }

            if (withCredentials) {
                request.withCredentials = withCredentials
            }
        }

        function addEvents(): void {
            request.onreadystatechange = function handleLoad() {
                if (request.readyState !== 4) {
                    return
                }

                // 非200状态码处理
                if (request.status === 0) {
                    return
                }

                /* XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的值是一段字符串
                每一行都是以回车符和换行符 \r\n 结束，它们是每个 header 属性的分隔符
                需要解析成对象
                {
                    date: 'Fri, 05 Apr 2019 12:40:49 GMT'
                    etag: 'W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"',
                    connection: 'keep-alive',
                    'x-powered-by': 'Express',
                    'content-length': '13'
                    'content-type': 'application/json; charset=utf-8'
                  } */
                const responseHeaders = parseHeaders(request.getAllResponseHeaders())
                const responseData = responseType !== 'text' ? request.response : request.responseText
                const response: AxiosResponse = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeaders,
                    config, 
                    request
                }
                handleResponse(response)
            }
            // 网络错误
            request.onerror = function handleError() {
                reject(createError('Network Error', config, null, request))
            }

            // 超时错误
            request.ontimeout = function handleTimeout() {
                reject(createError(`Timeout of ${timeout} ms exceed`, config, 'ECONNABRTED', request))
            }

            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress
            }

            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress
            }
        }

        function processHeaders(): void {
            if (isFormData(data)) {
                delete headers['Conent-Type']
            }

            if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName)
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue
                }
            }

            if (auth) {
                headers['Authorization'] = 'Basic ' + btoa (auth.username + ':' + auth.password)
            }

            Object.keys(headers).forEach((name) => {
                // data为空是，设置Content-Type没有意义
                if (data === null && name.toLowerCase() === 'content-type') { // data为空时，content是没有意义的，删除
                    delete headers[name]
                } else {
                    request.setRequestHeader(name, headers[name])
                }
            })

        }

        function processCancel(): void {
            if (cancelToken) {
                cancelToken.promise.then(reason => {
                    request.abort();
                    reject(reason);
                })
            }
        }

        function handleResponse(response: AxiosResponse): void {
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response)
            } else {
                reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
            }
        }
    })

}
