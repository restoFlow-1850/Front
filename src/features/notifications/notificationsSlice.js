// Bildirishnomalar tarixi — backendda saqlash endpoint'i yo'q (F5 bosilsa hammasi
// yo'qolmasligi kerak), shu sabab localStorage'ga persist qilinadi.
import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'restoflow.notifications'
const MAX_ITEMS = 50

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
        // localStorage to'lgan yoki brauzerda o'chirilgan bo'lishi mumkin — jim o'tkazamiz
    }
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: loadFromStorage(),
    },
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload)
            if (state.items.length > MAX_ITEMS) state.items.length = MAX_ITEMS
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

export const { addNotification, markAllRead, clearNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer
