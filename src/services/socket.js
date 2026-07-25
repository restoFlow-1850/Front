// Socket.io ulanishi — real-time buyurtma va bildirishnomalar uchun.
// Mas'ul: Ziyodulla (infra). Foydalanadi: kitchen, orders, notifications.
import { io } from 'socket.io-client'

// Backend ishga tushdi (Railway). Socket odatda root manzilda ishlaydi ('/api' siz).
// TODO: Swagger UI ulanganda socket namespace/yo'l tasdiqlansin.
const URL =
  import.meta.env.VITE_SOCKET_URL || 'https://backend-production-11b7.up.railway.app'

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
})

// Eventlar (backend bilan kelishilgan):
//   order:new             — yangi buyurtma (oshxona)
//   order:statusChanged   — status o'zgardi
//   order:ready           — tayyor (ofitsiantga)
//   table:updated         — stol holati
//   notification:new      — yangi bildirishnoma
export const connectSocket = (token) => {
  socket.auth = { token }
  socket.connect()
}

export const disconnectSocket = () => socket.disconnect()
