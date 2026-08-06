import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api'
import { setCredentials } from '../authSlice'
import { saveSession } from '../session'
import { ROLE_HOME } from '../../../constants/roles'
import { rolesForPath } from '../../../constants/navigation'
import { connectSocket } from '../../../services/socket'

const schema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Kamida 6 ta belgi bo'lishi kerak"),
})

/**
 * Login'dan keyin qayerga o'tishni hal qiladi.
 *
 * Kelgan sahifaga (`from`) qaytarish faqat shu rol o'sha sahifani ocha olsagina
 * mantiqiy. Aks holda quyidagi holat yuzaga keladi: admin /dashboard'da chiqadi →
 * PrivateRoute /login'ga `from=/dashboard` bilan yuboradi → keyin ofitsiant kiradi
 * va to'g'ridan-to'g'ri /403 ga tushadi. Ruxsat bo'lmasa rol uyiga yuboramiz.
 */
function resolveRedirect(from, role) {
  if (from) {
    const allowed = rolesForPath(from)
    if (allowed.length === 0 || allowed.includes(role)) return from
  }
  return ROLE_HOME[role] ?? '/'
}

export default function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setError(null)
    try {
      const response = await authApi.login(values)
      const data = response.data?.data ?? response.data
      saveSession(data)
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }))
      connectSocket(data.accessToken) // login'da socketni ulash
      navigate(resolveRedirect(location.state?.from?.pathname, data.user?.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Tizimga kirishda xatolik yuz berdi')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="behruz@restoflow.uz"
          className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="password">
          Parol
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 pr-24 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4A2F37]"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Yashirish' : 'Ko‘rsatish'}
          </button>
        </div>
        {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
      </div>

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#2A1B22] px-4 py-3 font-semibold text-[#FDF9F6] shadow-lg shadow-[#2A1B22]/20 transition hover:-translate-y-0.5 hover:bg-[#4A2F37] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Kuting...' : 'Kirish'}
      </button>
    </form>
  )
}