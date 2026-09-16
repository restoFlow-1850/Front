// Redux Toolkit store — global holat (auth, ui, ...).
// Har feature o'z slice'ini shu yerga ulaydi.
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
  },
})
