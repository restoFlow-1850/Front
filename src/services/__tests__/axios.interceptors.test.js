import { describe, it, expect, vi, beforeEach } from 'vitest'

const { requestHandlers, responseHandlers, instance, postMock } = vi.hoisted(() => {
  const requestHandlers = []
  const responseHandlers = []
  const instance = vi.fn()
  instance.defaults = {}
  instance.interceptors = {
    request: { use: (ok) => requestHandlers.push(ok) },
    response: { use: (ok, reject) => responseHandlers.push({ ok, reject }) },
  }
  return { requestHandlers, responseHandlers, instance, postMock: vi.fn() }
})

vi.mock('axios', () => ({
  default: {
    create: () => instance,
    post: (...args) => postMock(...args),
  },
}))

import api from '../axios'
import { SESSION_CLEARED_EVENT } from '../../features/auth/session'

const unauthorized = () => ({
  config: { url: '/reports', headers: {} },
  response: { status: 401, data: {} },
})

describe('api auth interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
    postMock.mockReset()
  })

  it('creates one shared instance for every panel request', () => {
    expect(api).toBe(instance)
  })

  it('never sends a fake/demo token as Authorization', () => {
    const handler = requestHandlers[0]
    localStorage.setItem('accessToken', 'demo-access-1760000000000')
    expect(handler({ headers: {} }).headers.Authorization).toBeUndefined()

    localStorage.setItem('accessToken', 'undefined')
    expect(handler({ headers: {} }).headers.Authorization).toBeUndefined()

    localStorage.setItem('accessToken', 'real.jwt')
    expect(handler({ headers: {} }).headers.Authorization).toBe('Bearer real.jwt')
  })

  it('extracts a refreshed token from a nested backend response', async () => {
    localStorage.setItem('accessToken', 'expired.jwt')
    postMock.mockResolvedValue({
      data: { success: true, data: { tokens: { accessToken: 'refreshed.jwt' } } },
    })

    const { reject } = responseHandlers[0]
    await expect(reject(unauthorized())).resolves.toBeUndefined()

    expect(localStorage.getItem('accessToken')).toBe('refreshed.jwt')
    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      {},
      { withCredentials: true },
    )
  })

  it('keeps the session when refresh fails at transport level', async () => {
    localStorage.setItem('accessToken', 'expired.jwt')
    const cleared = vi.fn()
    window.addEventListener(SESSION_CLEARED_EVENT, cleared)
    postMock.mockRejectedValue(new Error('Network Error'))

    const { reject } = responseHandlers[0]
    await expect(reject(unauthorized())).rejects.toThrow('Network Error')

    expect(localStorage.getItem('accessToken')).toBe('expired.jwt')
    expect(cleared).not.toHaveBeenCalled()
    window.removeEventListener(SESSION_CLEARED_EVENT, cleared)
  })
})
