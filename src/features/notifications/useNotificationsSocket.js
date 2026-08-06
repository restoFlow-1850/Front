// Real-time bildirishnomalar — bitta joyda ulanadi (AppLayout, ilova bo'ylab bir marta).
// Bu muhim: har bir komponent o'zi socket.on() qo'yib ketsa, remount bo'lganda listener
// ko'payadi va bitta xabar bir necha marta chiqadi. useEffect cleanup'da socket.off()
// har doim mos ravishda chaqiriladi.
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from '../../services/socket'
import { getTables } from './api'
import { addNotification } from './notificationsSlice'
import { toast } from '../../components/ui'
import { ROLES } from '../../constants/roles'

// TASDIQLANMAGAN TAXMIN: Table modelida ofitsiantga biriktirish maydoni bor deb
// taxmin qilinmoqda ("waiter" yoki "assignedWaiter"). Backend kodida bu maydon
// aniq nomini tekshirish kerak — agar boshqacha bo'lsa shu yerni to'g'irlash kifoya.
function resolveTableWaiterId(table) {
    const raw = table.waiter ?? table.assignedWaiter
    if (!raw) return null
    return typeof raw === 'object' ? raw._id : raw
}

export default function useNotificationsSocket() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    // Har render'da qayta yaratilmasligi uchun ref: stollar xaritasi socket handler
    // ichida ishlatiladi, lekin o'zgarishi effektni qayta ishga tushirmasligi kerak.
    const tablesRef = useRef({ byId: new Map(), waiterFieldSeen: false })

    useEffect(() => {
        let cancelled = false

        const loadTables = async () => {
            try {
                const res = await getTables()
                const payload = res.data.data ?? res.data
                const tables = payload.tables ?? payload ?? []
                if (cancelled) return

                const byId = new Map()
                let waiterFieldSeen = false
                tables.forEach((table) => {
                    const waiterId = resolveTableWaiterId(table)
                    if (waiterId) waiterFieldSeen = true
                    byId.set(table._id, { number: table.number, waiterId })
                })
                tablesRef.current = { byId, waiterFieldSeen }
            } catch {
                // Stollar ro'yxati kelmasa ham bildirishnoma ko'rsatishda davom etamiz,
                // faqat "Stol N" o'rniga xom ObjectId ko'rinadi.
            }
        }

        loadTables()

        const handleOrderReady = (payload) => {
            const { byId, waiterFieldSeen } = tablesRef.current
            const tableInfo = byId.get(payload.table)
            const tableNumber = tableInfo?.number ?? payload.table

            // Faqat ofitsiant uchun cheklaymiz, va faqat "waiter" maydoni backendda
            // haqiqatan mavjud bo'lsa (waiterFieldSeen). Aks holda hammaga ko'rsatamiz —
            // yashirib qo'yishdan ko'ra ortiqcha ko'rsatish xavfsizroq.
            const isWaiter = user?.role === ROLES.WAITER
            const currentUserId = user?._id ?? user?.id
            if (isWaiter && waiterFieldSeen && tableInfo?.waiterId && tableInfo.waiterId !== currentUserId) {
                return
            }

            const notification = {
                id: `${payload.orderId}-${Date.now()}`,
                type: 'order:ready',
                orderId: payload.orderId,
                tableNumber,
                message: `Stol ${tableNumber}: buyurtma tayyor!`,
                read: false,
                createdAt: new Date().toISOString(),
            }

            dispatch(addNotification(notification))
            toast.success(notification.message)
        }

        socket.on('order:ready', handleOrderReady)
        socket.on('table:updated', loadTables)

        return () => {
            cancelled = true
            socket.off('order:ready', handleOrderReady)
            socket.off('table:updated', loadTables)
        }
    }, [dispatch, user])
}
