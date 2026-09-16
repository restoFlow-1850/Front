// Socket ulanish holatini kuzatib boradi — UI'da indikator ko'rsatish uchun
// (masalan AppLayout'da "ulanmagan" ogohlantirish).
import { useEffect, useState } from 'react'
import { socket } from '../services/socket'

export function useSocketStatus() {
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  return isConnected
}
