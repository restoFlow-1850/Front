// Barcha ochiq tab'larda sessiya sinxronlashtirish.
// Bir tab'da "Chiqish" bosilsa yoki token muddati tugasa, qolgan tab'lar ham
// avtomatik ravishda login'ga qaytariladi. Redux ham localStorage bilan bir xil
// holatga keltiriladi — aks holda UI "kirgan" ko'rinib, API 401 qaytaraveradi.
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCredentials } from '../features/auth/authSlice'
import { readToken, SESSION_CLEARED_EVENT } from '../features/auth/session'

export function useAuthSync() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        function syncSession(event) {
            if (event?.key && event.key !== 'accessToken') return
            if (readToken('accessToken')) return

            dispatch(clearCredentials())
            navigate('/login', { replace: true })
        }

        window.addEventListener('storage', syncSession)
        window.addEventListener(SESSION_CLEARED_EVENT, syncSession)
        return () => {
            window.removeEventListener('storage', syncSession)
            window.removeEventListener(SESSION_CLEARED_EVENT, syncSession)
        }
    }, [dispatch, navigate])
}
