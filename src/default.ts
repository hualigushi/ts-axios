import { AxiosRequestConfig } from './types'
import { processHeaders } from './helpers/headers'
import { transformRequest, tranformResponse } from './healpers/data'

const defaults : AxiosRequestConfig = {
    method: 'get',
    timeput: 0,
    headers: {
        common: {
            Accept: 'application/json, text/plain, */*'
        }
    }
  
  transformRequest: [
     function (data: any, headers? : any): any {
        processHeaders(headers, data)
        return transformRequest(data)
     }
  ],
  
  transformResponse: [
     function (data: any):any {
        return tranformResponse(data)
     }
  ]
}

const methodsNoData = ['delete', 'get', 'head', 'options']

methodsNoData.forEach(method => {
    defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']

methodsWithData.forEach(method => {
    defaults.headers[method] = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})

export default defaults
