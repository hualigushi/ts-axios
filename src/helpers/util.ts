const toString = Object.prototype.toString // 方法缓存

export function isDate (val: any):val is Date { // val is Date类型保护
    return toString.call(val) === '[object Date]'
}

// export function isObject(val: any):val is Object {
//     return val !== null && typeof val === 'object'
// }

export function isPlainObject (val: any): val is Object {
    return toString.call(val) === '[object Object]'
}