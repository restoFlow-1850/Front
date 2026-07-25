// Redux Toolkit store — global holat (auth, ui, ...).
// Har feature o'z slice'ini shu yerga ulaydi.
import { configureStore, createSlice } from '@reduxjs/toolkit'
// import authReducer from '../features/auth/authSlice' // Fayoz

// Vaqtinchalik placeholder — hech bir feature hali slice qo'shmagan bo'lsa ham
// configureStore bo'sh reducer bilan xato berishining oldini oladi.
// Birinchi haqiqiy slice qo'shilgach, bu olib tashlanadi.
const appSlice = createSlice({
  name: 'app',
  initialState: { ready: true },
  reducers: {},
})

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    // auth: authReducer,
  },
})
