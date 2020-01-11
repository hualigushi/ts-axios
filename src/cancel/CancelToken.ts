import { CancelExecutor, CancelTokenSource, Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

 /*  在 CancelToken 构造函数内部，
  实例化一个 pending 状态的 Promise 对象，
  然后用一个 resolvePromise 变量指向 resolve 函数。
  接着执行 executor 函数，传入一个 cancel 函数，
  在 cancel 函数内部，会调用 resolvePromise 
  把 Promise 对象从 pending 状态变为 resolved 状态。 */
  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    executor(message => {
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }

  /* 当一个请求携带的 cancelToken 已经被使用过，
  那么我们甚至都可以不发送这个请求，
  只需要抛一个异常即可，并且抛异常的信息就是我们取消的原因
  判断如果存在 this.reason，说明这个 token 已经被使用过了，直接抛错
  */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason
    }
  }

 /*  定义一个 cancel 变量实例化一个 CancelToken 类型的对象，
  然后在 executor 函数中，把 cancel 指向参数 c 这个取消函数 
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  axios.get('/user/12345', {
    cancelToken: source.token
  }).catch(function (e) {
    if (axios.isCancel(e)) {
      console.log('Request canceled', e.message);
    } else {
      // 处理错误
    }
  });

  // 取消请求 (请求原因是可选的)
  source.cancel('Operation canceled by the user.');
  */
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
