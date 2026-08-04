// Socket.io ulanishi — real-time buyurtma va bildirishnomalar uchun.
// Mas'ul: Ziyoddila (infra). Foydalanadi: kitchen, orders, notifications.
import { io } from 'socket.io-client'

// DIQQAT: bu yerdagi fallback services/axios.js dagi bilan BIR XIL bo'lishi SHART.
// http://localhost:3000 turgani uchun mahalliy backend ishlamasa, brauzer
// WebSocket'ni cheksiz qayta ulashga urinib, konsolni xato bilan to'ldirardi.
const URL =
  import.meta.env.VITE_SOCKET_URL || 'https://backend-production-11b7.up.railway.app'

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 8000,
})

// Eventlar (backenddan tasdiqlangan):
//   order:created          — yangi buyurtma (umumiy)
//   kitchen:new_order      — yangi buyurtma, oshxona xonasiga maxsus (ovozli signal shu yerda)
//   order:status_updated   — buyurtma statusi o'zgardi
//   order:status_changed   — status o'zgarishi uchun muqobil nom (ikkalasi ham tinglanadi)
//   table:status_updated   — stol holati o'zgardi
export const connectSocket = (token) => {
  socket.auth = { token }
  socket.connect()
}

export const disconnectSocket = () => socket.disconnect()

if (import.meta.env.DEV) window.__socket = socket // TEMP: demo uchun
