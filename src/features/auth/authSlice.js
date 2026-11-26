import { createSlice } from '@reduxjs/toolkit'
import { clearSession, extractToken, isValidToken, readToken, readUser, storeAccessToken } from './session'

const initialState = {
  user: readUser(),
  accessToken: readToken('accessToken'),
  // refreshToken yo'q — httpOnly cookie'da (#18), JavaScript'ga ko'rinmaydi
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload
      const token = extractToken(action.payload)

      state.user = user
      state.accessToken = isValidToken(token) ? token : null
      // localStorage — API interceptor uchun yagona haqiqiy manba.
      // Redux faqat tokenni saqlab, localStorage'ni yangilamasa, UI login ko'rsatadi,
      // lekin /reports kabi so'rovlarga Authorization header qo'yilmaydi → 401.
      if (user) localStorage.setItem('user', JSON.stringify(user))
      storeAccessToken(state.accessToken)
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