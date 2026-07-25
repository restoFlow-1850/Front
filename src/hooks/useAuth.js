// Vaqtinchalik auth hook — localStorage'dan token/role o'qiydi.
// TODO (Fayoz): auth slice tayyor bo'lgach, shu hookni Redux'ga ulash
// (interfeys bir xil qolsin: { isAuthenticated, user, logout }).
import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('storage', callback)
  window.addEventListener('auth:changed', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('auth:changed', callback)
  }
}

function getSnapshot() {
  return window.localStorage.getItem('accessToken')
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getSnapshot)
  let user = null
  try {
    const raw = window.localStorage.getItem('user')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  const logout = () => {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('user')
    window.dispatchEvent(new Event('auth:changed'))
  }

  return { isAuthenticated: Boolean(token), user, token, logout }
}
