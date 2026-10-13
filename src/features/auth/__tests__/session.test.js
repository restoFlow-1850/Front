import { describe, it, expect, beforeEach } from 'vitest'
import { saveSession, clearSession, readToken, takeLegacyRefreshToken } from '../session'

// #18: refresh token localStorage'ga YOZILMASLIGI kerak — u httpOnly cookie'da.

describe('session (refresh token in httpOnly cookie)', () => {
  beforeEach(() => localStorage.clear())

  it('saveSession stores access token and user, but never the refresh token', () => {
    saveSession({ user: { name: 'Ali' }, accessToken: 'acc.jwt', refreshToken: 'ref.jwt' })
    expect(localStorage.getItem('accessToken')).toBe('acc.jwt')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ name: 'Ali' })
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('saveSession purges a refresh token left by an older version', () => {
    localStorage.setItem('refreshToken', 'old.jwt')
    saveSession({ accessToken: 'acc.jwt' })
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('clearSession removes access token, user and legacy refresh token', () => {
    localStorage.setItem('accessToken', 'a')
    localStorage.setItem('refreshToken', 'r')
    localStorage.setItem('user', '{}')
    clearSession()
    expect(localStorage.length).toBe(0)
  })

  it('takeLegacyRefreshToken returns the old token once, then it is gone', () => {
    localStorage.setItem('refreshToken', 'old.jwt')
    expect(takeLegacyRefreshToken()).toBe('old.jwt')
    expect(takeLegacyRefreshToken()).toBeNull()
  })

  it('takeLegacyRefreshToken ignores "undefined"/"null" garbage', () => {
    localStorage.setItem('refreshToken', 'undefined')
    expect(takeLegacyRefreshToken()).toBeNull()
    expect(readToken('refreshToken')).toBeNull()
  })
})

describe('api client', () => {
  it('sends cookies (withCredentials) so the httpOnly refresh cookie reaches /auth/*', async () => {
    const { default: api } = await import('../../../services/axios')
    expect(api.defaults.withCredentials).toBe(true)
  })
})
