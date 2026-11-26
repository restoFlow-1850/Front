import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  extractToken,
  isSessionForCurrentApi,
  isValidToken,
  saveSession,
  clearSession,
  readToken,
  takeLegacyRefreshToken,
  SESSION_CLEARED_EVENT,
} from '../session'

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

describe('session token validation', () => {
  beforeEach(() => localStorage.clear())

  it('rejects fake demo tokens and string garbage', () => {
    expect(isValidToken('demo-access-1760000000000')).toBe(false)
    expect(isValidToken('demo-refresh-1')).toBe(false)
    expect(isValidToken('undefined')).toBe(false)
    expect(isValidToken('null')).toBe(false)
    expect(isValidToken(undefined)).toBe(false)
    expect(isValidToken('real.jwt')).toBe(true)
  })

  it('extracts a token from nested backend response shapes', () => {
    expect(extractToken({ data: { tokens: { accessToken: 'nested.jwt' } } })).toBe('nested.jwt')
    expect(extractToken({ token: 'plain.jwt' })).toBe('plain.jwt')
    expect(extractToken({ accessToken: 'demo-access-1' })).toBeNull()
  })

  it('saves a nested token and refuses to save an invalid one', () => {
    saveSession({ user: { name: 'Ali' }, data: { accessToken: 'nested.jwt' } })
    expect(localStorage.getItem('accessToken')).toBe('nested.jwt')

    saveSession({ user: { name: 'Ali' }, accessToken: 'demo-access-1' })
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('detects a token issued for a different backend', () => {
    saveSession({ accessToken: 'old-backend.jwt' })
    expect(isSessionForCurrentApi()).toBe(true)

    localStorage.setItem('restoflow_session_api_origin', 'https://old-backend.example/api')
    expect(isSessionForCurrentApi()).toBe(false)

    clearSession()
    expect(isSessionForCurrentApi()).toBe(true)
  })

  it('announces a cleared session to the other tabs', () => {
    const listener = vi.fn()
    window.addEventListener(SESSION_CLEARED_EVENT, listener)
    localStorage.setItem('accessToken', 'a.jwt')

    clearSession()
    expect(listener).toHaveBeenCalledTimes(1)

    clearSession()
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESSION_CLEARED_EVENT, listener)
  })
})

describe('api client', () => {
  it('sends cookies (withCredentials) so the httpOnly refresh cookie reaches /auth/*', async () => {
    const { default: api } = await import('../../../services/axios')
    expect(api.defaults.withCredentials).toBe(true)
  })
})
