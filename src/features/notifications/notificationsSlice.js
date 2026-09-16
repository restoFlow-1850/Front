// Bildirishnomalar — backend API + localStorage fallback.
// Backend endpoint mavjud bo'lsa: GET /notifications, PATCH /:id/read, POST /read-all.
// Backend ulanmasa: localStorage'dan o'qiladi (offline mode).
import { createSlice } from '@reduxjs/toolkit'
import * as api from './api'

const STORAGE_KEY = 'restoflow.notifications'
const MAX_ITEMS = 100

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveToStorage(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
    } catch {
        // localStorage to'lgan — jim o'tkazamiz
    }
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: loadFromStorage(),
        loading: false,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.items = action.payload
            state.loading = false
            saveToStorage(state.items)
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        addNotification: (state, action) => {
            state.items.unshift(action.payload)
            if (state.items.length > MAX_ITEMS) state.items.length = MAX_ITEMS
            saveToStorage(state.items)
        },
        markRead: (state, action) => {
            const item = state.items.find((n) => n._id === action.payload || n.id === action.payload)
            if (item) item.read = true
            saveToStorage(state.items)
        },
        markAllRead: (state) => {
            state.items.forEach((item) => { item.read = true })
            saveToStorage(state.items)
        },
        clearNotifications: (state) => {
            state.items = []
            saveToStorage(state.items)
        },
    },
})

export const {
    setNotifications,
    setLoading,
    addNotification,
    markRead,
    markAllRead,
    clearNotifications,
} = notificationsSlice.actions

// ─── Async thunks (backend API bilan sinxronlash) ─────────────────────────────

/** Backend'dan bildirishnomalarni yuklash. */
export const fetchNotifications = () => async (dispatch) => {
    dispatch(setLoading(true))
    try {
        const res = await api.getNotifications({ limit: MAX_ITEMS })
        const payload = res?.data?.data ?? res?.data ?? {}
        const items = payload.notifications ?? payload.items ?? payload ?? []
        if (Array.isArray(items)) {
            dispatch(setNotifications(items))
        } else {
            dispatch(setLoading(false))
        }
    } catch {
        // Backend ulanmasa — localStorage'dagi mavjud ma'lumot qoladi
        dispatch(setLoading(false))
    }
}

/** Bitta bildirishnomani backend'da o'qilgan qilish. */
export const markNotificationRead = (id) => async (dispatch) => {
    dispatch(markRead(id))
    try {
        await api.markNotificationRead(id)
    } catch {
        // Backend xatolik bersa ham local state yangilandi
    }
}

/** Barcha bildirishnomalarni backend'da o'qilgan qilish. */
export const markAllNotificationsRead = () => async (dispatch) => {
    dispatch(markAllRead())
    try {
        await api.markAllNotificationsRead()
    } catch {
        // Backend xatolik bersa ham local state yangilandi
    }
}

/** Bildirishnomalarni backend'dan o'chirish. */
export const clearAllNotifications = () => async (dispatch) => {
    dispatch(clearNotifications())
    try {
        await api.clearNotifications()
    } catch {
        // Backend xatolik bersa ham local state tozalandi
    }
}

export default notificationsSlice.reducer
