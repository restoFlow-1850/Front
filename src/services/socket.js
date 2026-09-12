// Socket.io ulanishi — real-time buyurtma va bildirishnomalar uchun.
// Mas'ul: Ziyoddila (infra). Foydalanadi: kitchen, orders, notifications.
import { io } from 'socket.io-client'

const rawApiUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const apiUrl = rawApiUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://backend-production-109c0.up.railway.app/api')
const defaultSocketUrl = apiUrl.replace(/\/api\/?$/, '')
const rawSocketUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SOCKET_URL : undefined
const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)
const URL = rawSocketUrl || (isDev && typeof window !== 'undefined' ? window.location.origin : defaultSocketUrl)

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
})

// Eventlar (backend bilan kelishilgan):
//   order:new             — yangi buyurtma (oshxona)
//   order:statusChanged   — status o'zgardi
//   order:ready           — tayyor (ofitsiantga)
//   table:status_updated — stol holati (backend kanonik nomi)
//   notification:new      — yangi bildirishnoma
export const connectSocket = (token) => {
  socket.auth = { token }
  socket.connect()
}

export const disconnectSocket = () => socket.disconnect()

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__socket = socket // TEMP: demo uchun
}
