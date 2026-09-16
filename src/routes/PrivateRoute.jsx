// Himoyalangan marshrut — faqat TOKEN tekshiradi (rol tekshiruvi RoleRoute'da).
//
// Muhim: sahifa F5 bilan yangilanganda Redux bo'sh bo'ladi va faqat localStorage
// qoladi. Agar token bor-u user yo'q bo'lsa, rolga bog'liq marshrutlar noto'g'ri
// ishlaydi (user.role undefined → hamma joyga kirish taqiqlanadi). Shuning uchun
// bu yerda /auth/me chaqirib sessiyani tiklaymiz va tugaguncha kutamiz.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { authApi } from '../features/auth/api'
import { setCredentials, clearCredentials } from '../features/auth/authSlice'
import { readToken, clearSession } from '../features/auth/session'
import FullPageLoader from '../components/common/FullPageLoader'

export default function PrivateRoute() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user, accessToken } = useSelector((state) => state.auth)

  const token = accessToken || readToken('accessToken')
  const needsBootstrap = Boolean(token) && !user

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authApi.getMe()
      return res.data?.data?.user ?? res.data?.data ?? res.data
    },
    enabled: needsBootstrap,
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (data) {
      localStorage.setItem('user', JSON.stringify(data))
      dispatch(
        setCredentials({
          user: data,
          accessToken: token,
          refreshToken: readToken('refreshToken'),
        }),
      )
    }
  }, [data, dispatch, token])

  useEffect(() => {
    if (isError) {
      clearSession()
      dispatch(clearCredentials())
    }
  }, [isError, dispatch])

  if (!token) {
    clearSession()
    const isExcluded =
      location.pathname === '/403' ||
      location.pathname === '/profile' ||
      location.pathname.startsWith('/login')
    return <Navigate to="/login" state={isExcluded ? null : { from: location }} replace />
  }

  if (needsBootstrap && (isLoading || (!data && !isError))) {
    return <FullPageLoader label="Sessiya tiklanmoqda..." />
  }

  if (isError) {
    const isExcluded =
      location.pathname === '/403' ||
      location.pathname === '/profile' ||
      location.pathname.startsWith('/login')
    return <Navigate to="/login" state={isExcluded ? null : { from: location }} replace />
  }

  return <Outlet />
}
