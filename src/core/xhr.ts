import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

/* 请求逻辑整个流程分为 7 步：

创建一个 request 实例。
执行 request.open 方法初始化。
执行 configureRequest 配置 request 对象。
执行 addEvents 给 request 添加事件处理函数。
执行 processHeaders 处理请求 headers。
执行 processCancel 处理请求取消逻辑。
执行 request.send 方法发送请求。 */
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => { // 返回Promise
        const {
            data = null,
            url,
            method, 
            headers = {},
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

        request.open(method!.toUpperCase(), url!, true)

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

            /* 在同域的情况下，我们发送请求会默认携带当前域下的 cookie，
            但是在跨域的情况下，默认是不会携带请求域下的 cookie 的，
            比如 http://domain-a.com 站点发送一个 http://api.domain-b.com/get 的请求，
            默认是不会携带 api.domain-b.com 域下的 cookie，
            如果我们想携带（很多情况下是需要的），
            只需要设置请求的 xhr 对象的 withCredentials 为 true 即可。 */
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
                const responseData = responseType && responseType !== 'text' ? request.response : request.responseText
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
                reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABRTED', request))
            }

            if (onDownloadProgress) {
                request.onprogress = onDownloadProgress // xhr 对象提供了一个 progress 事件，我们可以监听此事件对数据的下载进度做监控
            }

            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress // xhr.uplaod 对象也提供了 progress 事件，我们可以基于此对上传进度做监控
            }
        }

        function processHeaders(): void {
            /* 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，
            让浏览器自动根据请求数据设置 Content-Type
            比如当我们通过 FormData 上传文件的时候，
            浏览器会把请求 headers 中的 Content-Type 设置为 multipart/form-data。 */
            if (isFormData(data)) {
                delete headers['Content-Type']
            }

            /* 首先判断如果是配置 withCredentials 为 true 或者是同域请求，我们才会请求 headers 添加 xsrf 相关的字段
            
            如果判断成功，尝试从 cookie 中读取 xsrf 的 token 值。

            如果能读到，则把它添加到请求 headers 的 xsrf 相关字段中。 */
            if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName)
                if (xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue
                }
            }

            /* HTTP 协议中的 Authorization 请求 header 会包含服务器用于验证用户代理身份的凭证，
            通常会在服务器返回 401 Unauthorized 状态码以及 WWW-Authenticate 消息头之后在后续请求中发送此消息头。

            auth 是一个对象结构，包含 username 和 password 2 个属性。
            一旦用户在请求的时候配置这俩属性，我们就会自动往 HTTP 的 请求 header 中添加 Authorization 属性，
            它的值为 Basic 加密串。 这里的加密串是 username:password base64 加密后的结果 */
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

       /*  想要实现取消某次请求，我们需要为该请求配置一个 cancelToken，
        然后在外部调用一个 cancel 方法。
        请求的发送是一个异步过程，最终会执行 xhr.send 方法，
        xhr 对象提供了 abort 方法，可以把请求取消。
        因为我们在外部是碰不到 xhr 对象的，
        所以我们想在执行 cancel 的时候，去执行 xhr.abort 方法。
        现在就相当于我们在 xhr 异步请求过程中，插入一段代码，
        当我们在外部执行 cancel 函数的时候，会驱动这段代码的执行，
        然后执行 xhr.abort 方法取消请求。
        我们可以利用 Promise 实现异步分离，
        也就是在 cancelToken 中保存一个 pending 状态的 Promise 对象，
        然后当我们执行 cancel 方法的时候，能够访问到这个 Promise 对象，
        把它从 pending 状态变成 resolved 状态，
        这样我们就可以在 then 函数中去实现取消请求的逻辑 */
        function processCancel(): void {
            if (cancelToken) {
                cancelToken.promise.then(reason => {
                    request.abort();
                    reject(reason);
                })
            }
        }

        function handleResponse(response: AxiosResponse): void {
            /* 自定义合法状态码
            axios.get('/more/304', {
                validateStatus(status) {
                  return status >= 200 && status < 400
                }
              }).then(res => {
                console.log(res)
              }).catch((e: AxiosError) => {
                console.log(e.message)
              }) */
            if (!validateStatus || validateStatus(response.status)) {
                resolve(response)
            } else {
                reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
            }
        }
    })

}
