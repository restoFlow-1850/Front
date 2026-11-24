// Barcha ochiq tab'larda sessiyani sinxronlashtirish.
// 1) Bir tab'da "Chiqish" bosilsa, boshqa ochiq tab'lar ham avtomatik logout bo'ladi.
// 2) Boshqa tab'da BOSHQA foydalanuvchi (masalan ofitsiant) login qilsa, token va user
//    localStorage'da almashadi. Bu tab esa eski foydalanuvchi (masalan oshpaz) UI'sini
//    ko'rsatib, yangi token (boshqa rol) bilan so'rov yuboradi → "waiter roli ... o'tkaza olmaydi".
//    Shuning uchun identifikator/rol o'zgarganda sahifa qayta yuklanadi.
import { useEffect } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCredentials } from '../features/auth/authSlice'
import { readUser } from '../features/auth/session'

const identity = (user) => (user ? `${user.id ?? user._id ?? ''}:${user.role ?? ''}` : '')

export function useAuthSync() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const store = useStore()

    useEffect(() => {
        function handleStorageChange(event) {
            if (event.key === 'accessToken' && !event.newValue) {
                dispatch(clearCredentials())
                navigate('/login', { replace: true })
                return
            }
            if ((event.key === 'accessToken' || event.key === 'user') && event.newValue) {
                const stored = readUser()
                const current = store.getState().auth?.user
                if (stored && identity(stored) !== identity(current)) {
                    window.location.reload()
                }
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [dispatch, navigate, store])
}
