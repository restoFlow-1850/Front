// Barcha ochiq tab'larda logout sinxronlashtirish.
// Bir tab'da "Chiqish" bosilsa, boshqa ochiq tab'lar ham avtomatik logout bo'ladi.
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCredentials } from '../features/auth/authSlice'

export function useAuthSync() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        function handleStorageChange(event) {
            if (event.key === 'accessToken' && !event.newValue) {
                dispatch(clearCredentials())
                navigate('/login', { replace: true })
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [dispatch, navigate])
}