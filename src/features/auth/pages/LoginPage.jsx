import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api'
import { setCredentials } from '../authSlice'
import { saveSession } from '../session'
import { ROLE_HOME } from '../../../constants/roles'
import { connectSocket } from '../../../services/socket'
import { useTheme } from '../../../hooks/useTheme'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'
import { Sun, Moon } from 'lucide-react'

const schema = z.object({
  email: z.string().email("Email format invalid"),
  password: z.string().min(6, "Min 6 characters"),
})

/* SVG Icons */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 6L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
)

/* Inline keyframes for hero animations */
const animationStyles = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes pulse3d { 0%,100%{transform:perspective(600px) rotateY(0deg) scale(1)} 50%{transform:perspective(600px) rotateY(5deg) scale(1.02)} }
  @keyframes slideReveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(249,115,22,0.3)} 50%{box-shadow:0 0 40px rgba(249,115,22,0.6)} }
  @keyframes imageZoom { from{transform:scale(1.15)} to{transform:scale(1)} }
  @keyframes rotate3d { 0%{transform:perspective(800px) rotateY(-8deg) rotateX(2deg)} 50%{transform:perspective(800px) rotateY(8deg) rotateX(-2deg)} 100%{transform:perspective(800px) rotateY(-8deg) rotateX(2deg)} }
`

export default function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setError(null)
    try {
      const response = await authApi.login(values)
      const data = response.data?.data ?? response.data
      saveSession(data)
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      )
      connectSocket(data.accessToken)
      const targetHome = ROLE_HOME[data.user?.role] || '/dashboard'
      navigate(targetHome, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || t('kitchen.loadFailed'))
    }
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div className="relative flex h-screen w-full overflow-hidden bg-[#FFFDF9] dark:bg-[#0B0F17] font-sans">
        {/* Top right quick controls */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
            title={theme === 'dark' ? "Yorqin rejim" : "Tungi rejim"}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">Tungi</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline">Yorqin</span>
              </>
            )}
          </button>
          <LanguageSwitcher className="shadow-sm backdrop-blur-md bg-white/90 border border-slate-200 dark:bg-slate-900/90 dark:border-slate-800" />
        </div>

        {/* LEFT HERO SECTION */}
        <div className="relative hidden w-[45%] lg:flex lg:flex-col lg:justify-between overflow-hidden">
          {/* Background image with 3D rotation animation */}
          <div
            className="absolute inset-0"
            style={{ animation: 'rotate3d 20s ease-in-out infinite' }}
          >
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
              alt="Premium restaurant"
              className="h-full w-full object-cover"
              style={{ animation: 'imageZoom 1.5s ease-out forwards' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70" />
          </div>

          {/* Dark solid overlay for readability */}
          <div className="absolute inset-0 bg-[#111827]/40" />

          {/* Floating decorative circles */}
          <div className="absolute top-20 right-10 h-32 w-32 rounded-full border border-white/10" style={{ animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute bottom-40 left-8 h-20 w-20 rounded-full border border-[#F97316]/20" style={{ animation: 'float 4s ease-in-out infinite 1s' }} />
          <div className="absolute top-1/2 right-20 h-16 w-16 rounded-full bg-[#F97316]/10" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }} />

          <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10">
            {/* Logo */}
            <div
              className="inline-flex items-center gap-3 rounded-2xl bg-black/40 px-5 py-3 backdrop-blur-sm"
              style={{ animation: 'fadeInLeft 1s ease-out 0.2s both' }}
            >
              <img
                src="/restoflow-logo.svg"
                alt="RestoFlow"
                className="h-14 w-auto"
                style={{ filter: 'brightness(1.2) drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
              />
            </div>

            {/* Heading */}
            <div
              className="max-w-lg rounded-3xl bg-black/50 p-6 backdrop-blur-sm"
              style={{ animation: 'fadeInUp 1s ease-out 0.4s both' }}
            >
              <h1 className="text-4xl font-bold leading-tight xl:text-5xl !text-white" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }}>
                {t('auth.heroTitlePart1', { defaultValue: "Restoraningizni boshqarishni " })}
                <span style={{ background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))' }}>
                  {t('auth.heroTitlePart2', { defaultValue: "osonlashtiramiz" })}
                </span>
              </h1>
              <p
                className="mt-4 text-base leading-relaxed text-white/90"
                style={{ animation: 'slideReveal 1.2s ease-out 0.8s both' }}
              >
                {t('auth.heroSubtitle', { defaultValue: "Buyurtmalar, stol tizimi, oshxona boshqaruvi va hisobotlarni bir platformada professional va qulay interfeys bilan." })}
              </p>
            </div>

            {/* Glassmorphism card with 3D effect */}
            <div
              className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-lg max-w-sm"
              style={{
                animation: 'pulse3d 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F97316]/25 text-[#F97316]"
                  style={{ animation: 'scaleIn 0.8s ease-out 1s both' }}
                >
                  <ChartIcon />
                </div>
                <span className="font-semibold text-white text-lg">{t('auth.heroCardTitle', { defaultValue: "Samarali boshqaruv" })}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                {t('auth.heroCardDesc', { defaultValue: "Real-vaqtda buyurtmalarni kuzating, stollar kiriting va jamoangiz bilan samarali hamkorlik qiling." })}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 lg:px-16 overflow-y-auto">
          <div
            className="w-full max-w-[450px] rounded-[32px] bg-white dark:bg-[#1F2937] p-8 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.08)] my-auto"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
          >
            {/* Tab */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4 mb-8">
              <div className="flex items-center gap-2 text-[#F97316]">
                <ShieldIcon />
                <span className="text-lg font-bold">{t('auth.loginTitle', { defaultValue: "Kirish" })}</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
                {t('auth.welcomeHeader', { defaultValue: "Xush kelibsiz qaytganingizdan xursandmiz!" })}
              </h2>
              <p className="mt-2 text-sm text-[#6B7280] dark:text-gray-400">
                {t('auth.welcomeSub', { defaultValue: "Hisobingizga kiring va ishni davom ettiring." })}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-gray-200" htmlFor="email">
                  {t('auth.email', { defaultValue: "Email" })}
                </label>
                <div className="relative">
                  <MailIcon />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@misol.uz"
                    className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-[#FFFDF9] dark:bg-gray-700 py-3 pl-11 pr-4 text-sm text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111827] dark:text-gray-200" htmlFor="password">
                  {t('auth.password', { defaultValue: "Parol" })}
                </label>
                <div className="relative">
                  <LockIcon />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="********"
                    className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-[#FFFDF9] dark:bg-gray-700 py-3 pl-11 pr-11 text-sm text-[#111827] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316] cursor-pointer accent-[#F97316]"
                  />
                  <span className="text-sm text-[#6B7280] dark:text-gray-400">{t('auth.rememberMe', { defaultValue: "Meni eslab qolish" })}</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#F97316] hover:text-orange-600 transition-colors"
                >
                  {t('auth.forgotPassword', { defaultValue: "Parolni unutdingizmi?" })}
                </Link>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#F97316] to-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ height: '52px' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('loading', { defaultValue: "Kirilmoqda..." })}
                  </span>
                ) : t('auth.loginBtn', { defaultValue: "Kirish" })}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#6B7280] dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-[#F97316] hover:text-orange-600 transition-colors">
                {t('auth.registerTitle')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
