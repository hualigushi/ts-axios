import CancelToken from '../../src/cancel/CancelToken'
import Cancel from '../../src/cancel/Cancel'
import { Canceler } from '../../src/types'

describe('CancelToken', () => {
    describe('reason', () => {
       test('should returns a Cancel if cancelation has been requested', () => {
          let cancel: Canceler
          let token = new CancelToken(c => {
              cancel = c
          })
          cancel!('Operation has been canceled.')
          expect(token.reason).toEqual(expect.any(Cancel))
          expect(token.reason!.message).toBe('Operation has been canceled.')
       })

       test('should has no side effect if call cancellation for multi times', () => {
          let cancel: Canceler
          let token = new CancelToken(c => {
             cancel = c
          })
          cancel!('Operation has been canceled.')
          cancel!('Operation has been canceled.')
          expect(token.reason).toEqual(expect.any(Cancel))
          expect(token.reason!.message).toBe()
       })
    })
})
