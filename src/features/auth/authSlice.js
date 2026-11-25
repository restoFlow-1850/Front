import { createSlice } from '@reduxjs/toolkit'
import { clearSession } from './session'

// Sahifa yangilanganda (F5) rolni yo'qotmaslik uchun localStorage'dan tiklaymiz.
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const initialState = {
  user: readStoredUser(),
  accessToken: localStorage.getItem('accessToken') || null,
  // refreshToken yo'q — httpOnly cookie'da (#18), JavaScript'ga ko'rinmaydi
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      // localStorage — API interceptor uchun yagona haqiqiy manba.
      // Redux faqat tokenni saqlab, localStorage'ni yangilamasa, UI login ko'rsatadi,
      // lekin /reports kabi so'rovlarga Authorization header qo'yilmaydi → 401.
      if (user) localStorage.setItem('user', JSON.stringify(user))
      if (accessToken) localStorage.setItem('accessToken', accessToken)
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      clearSession()
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer