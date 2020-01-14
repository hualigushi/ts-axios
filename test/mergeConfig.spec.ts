import axios from '../src/index'
import mergeConfig from '../src/core/mergeConfig'

describe('mergeConfig', () => {
   const defaults = axios.defaults

   test('should accept undefined for second argument', () => {
      expect(mergeConfig(defaults, undefined)).toEqual(defaults)
   })

   test('should accpet an object for second argument', () => {
      expect(mergeConfig(defaults, {})).toEqual(defaults)
   })

   test('should not leave references', () => {
      const merged = mergeConfig(defaults, {})
      expect(merged).not.toBe(defaults)
      expect(merged.headers).not.toBe(defaults.headers)
   })

   test('should allow setting request options', () => {
      const localDefaults = {
         url: '__sample url__',
         params: '__sample params__',
         data: { foo: true }
      }

      const merged = mergeConfig(localDefaults, {})
      expect(merged.url).toBeUndefined()
      expect(merged.params).toBeUndefined()
      expect(merged.data).toBeUndefined()

   })

   test('should return default headers if pass config2 with undefined', () => {
      expect(
         mergeConfig(
            {
               auth: undefined
            },
            {
               auth: {
                  username: 'foo',
                  password: 'test'
               }
            }
         )
      ).toEqual({
         auth: {
            username: 'foo',
            password: 'test'
         }
      })

      expect(
         mergeConfig(
            {
               auth: {
                  username: 'foo',
                  password: 'test'
               }
            },
            {
               auth: {
                  username: 'baz',
                  password: 'foobar'
               }
            }
         )
      ).toEqual({
         auth: {
            username: 'baz',
            password: 'foobar'
         }
      })
   })

   test('should overwrite auth, headers with a non-object value', () => {
      expect(
         mergeConfig(
            {
               headers: {
                  common: {
                     Accept: 'application/json, text/plain, */*'
                  }
               }
            },
            {
               headers: null
            }
         )
      ).toEqual({
         headers: null
      })
   })

   test('should allow setting other options', () => {
      const merged = mergeConfig(defaults, {
         timeout: 123
      })

      expect(merged.timeout).toBe(123)
   })
})
