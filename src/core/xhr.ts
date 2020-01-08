import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const {
            data = null,
            url,
            method = 'get',
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
        } = config
        
        const request = new XMLHttpRequest()

        request.open(method.toUpperCase(), url!, true)

        configureRequest()

        addEvents()

        processHeaders()

        processCancel()

        request.send(data)

        function configureRequest(): void {
            if (responseType) {
                request.responseType = responseType
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
