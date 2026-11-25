import { describe, it, expect, beforeEach } from 'vitest'
import authReducer, { setCredentials, clearCredentials } from '../authSlice'

describe('authSlice token sync', () => {
  beforeEach(() => localStorage.clear())

  it('persists accessToken to localStorage together with Redux state', () => {
    const initial = authReducer(undefined, { type: '@@INIT' })
    const next = authReducer(
      initial,
      setCredentials({ user: { _id: '1', role: 'admin' }, accessToken: 'fresh-token' }),
    )

    expect(next.accessToken).toBe('fresh-token')
    expect(localStorage.getItem('accessToken')).toBe('fresh-token')
    expect(JSON.parse(localStorage.getItem('user')).role).toBe('admin')
  })

  it('clears token and user from both Redux and localStorage', () => {
    const initial = authReducer(undefined, { type: '@@INIT' })
    const loggedIn = authReducer(
      initial,
      setCredentials({ user: { role: 'admin' }, accessToken: 'fresh-token' }),
    )
    const loggedOut = authReducer(loggedIn, clearCredentials())

    expect(loggedOut.accessToken).toBeNull()
    expect(loggedOut.user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
