import { deepMerge, isPlainObject } from './util';
import { Method } from '../types';

// 因为请求 header 属性是大小写不敏感的，比如我们之前的例子传入 header 的属性名 content-type 就是全小写的，
// 所以我们先要把一些 header 属性名规范化
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return;
  }

  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  });
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type');
  
  // 当我们请求的数据是普通对象并且没有配置 headers 的时候，
  // 会自动为其添加 Content-Type:application/json;charset=utf-8；
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8';
    }
  }

  return headers;
}

/* 通过 XMLHttpRequest 对象的 getAllResponseHeaders 方法获取到的值是一段字符串
每一行都是以回车符和换行符 \r\n 结束，它们是每个 header 属性的分隔符。
对于上面这串字符串，我们希望最终解析成一个对象结构
{
    date: 'Fri, 05 Apr 2019 12:40:49 GMT'
    etag: 'W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"',
    connection: 'keep-alive',
    'x-powered-by': 'Express',
    'content-length': '13'
    'content-type': 'application/json; charset=utf-8'
  } */
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null);
  if (!headers) {
    return parsed;
  }

  headers.split('\r\n').forEach(line => {
    let [key, ...values] = line.split(':');
    key = key.trim().toLowerCase();
    if (!key) {
      return;
    }
    headers.split('\r\n').forEach(line => {
      let [key, ...vals] = line.split(':') // 后半部分的字符串内部也可能有 ":"
      key = key.trim().toLowerCase()
      if (!key) {
        return
      }
      let val = vals.join(':').trim()
      parsed[key] = val
    })
  
    return parsed
  });

  return parsed;
}

/* 经过合并后的配置中的 headers 是一个复杂对象，多了 common、post、get 等属性，
而这些属性中的值才是我们要真正添加到请求 header 中的
headers: {
    common: {
      Accept: 'application/json, text/plain,'
    },
    post: {
      'Content-Type':'application/x-www-form-urlencoded'
    }
  }
  我们需要把它压成一级的
  headers: {
    Accept: 'application/json, text/plain, ',
   'Content-Type':'application/x-www-form-urlencoded'
  }
  这里要注意的是，对于 common 中定义的 header 字段，我们都要提取，
  而对于 post、get 这类提取，需要和该次请求的方法对应
  我们可以通过 deepMerge 的方式把 common、post 的属性拷贝到 headers 这一级，
  然后再把 common、post 这些属性删掉 */
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers;
  }
  headers = deepMerge(headers.common, headers[method], headers);
  
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];

  methodsToDelete.forEach(method => {
    delete headers[method];
  });

  return headers;
}
