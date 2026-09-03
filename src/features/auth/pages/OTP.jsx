import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  UtensilsCrossed,
  ArrowLeft,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useTheme } from '../../../hooks/useTheme'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'
import { authApi, getAuthErrorMessage } from '../api'

export default function OTPPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const targetEmail = location.state?.email || ''
  const targetPhone = location.state?.phone || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (targetEmail || targetPhone) {
      authApi.sendOtp({ email: targetEmail, phone: targetPhone }).catch(() => {})
    }
  }, [targetEmail, targetPhone])

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer((tVal) => tVal - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('')
      const next = [...otp]
      pasted.forEach((char, i) => {
        if (i < 6) next[i] = char
      })
      setOtp(next)
      const nextFocus = Math.min(pasted.length, 5)
      inputRefs.current[nextFocus]?.focus()
      return
    }

    const next = [...otp]
    next[index] = value.replace(/\D/g, '')
    setOtp(next)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    try {
      await authApi.sendOtp({ email: targetEmail, phone: targetPhone })
      setTimer(60)
      toast.success(t('dashboard.telegramSent'))
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t('kitchen.loadFailed')))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      toast.error('6 xonali kodni kiriting')
      return
    }
    setIsSubmitting(true)
    try {
      await authApi.verifyOtp({ email: targetEmail, phone: targetPhone, code })
      toast.success(t('dashboard.telegramSent'))
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t('kitchen.loadFailed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F17] p-4 sm:p-6 font-sans transition-colors">
      {/* Top right controls */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
        </button>
        <LanguageSwitcher className="shadow-sm backdrop-blur-md bg-white/90 border border-slate-200 dark:bg-slate-900/90 dark:border-slate-800" />
      </div>

      <div className="w-full max-w-[440px]">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-500/30">
            <UtensilsCrossed size={20} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Resto<span className="text-[#F97316]">Flow</span>
          </span>
        </div>

        <div className="rounded-[28px] border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-none transition-all">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-[#F97316] mb-3">
              <ShieldCheck size={14} />
              <span>OTP</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              OTP Code
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="size-11 sm:size-12 rounded-xl border border-slate-200 bg-slate-50/70 text-center text-lg font-extrabold text-slate-900 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join('').length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C] py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('loading')}
                </span>
              ) : (
                <span>{t('confirm')}</span>
              )}
            </button>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#F97316] dark:text-slate-400 dark:hover:text-orange-400"
              >
                <ArrowLeft size={14} />
                <span>{t('back')}</span>
              </Link>

              {timer > 0 ? (
                <span className="text-slate-400">({timer}s)</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-bold text-[#F97316] hover:underline"
                >
                  <RotateCcw size={13} />
                  <span>{t('refresh')}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

