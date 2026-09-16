import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  UtensilsCrossed,
  Sun,
  Moon,
} from 'lucide-react'
import { authApi } from '../api'
import { useTheme } from '../../../hooks/useTheme'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'

const schema = z.object({
  email: z.string().email("Email format invalid"),
})

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    setError(null)
    setSuccessMsg('')
    try {
      await authApi.forgotPassword(values)
      setSuccessMsg(t('dashboard.telegramSent'))
    } catch (err) {
      setError(err.response?.data?.message || t('kitchen.loadFailed'))
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
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-[#F97316] mb-3">
              <KeyRound size={14} />
              <span>{t('auth.forgotPassword')}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('auth.forgotPassword')}
            </h1>
          </div>

          {successMsg ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{successMsg}</p>
                </div>
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>{t('back')}</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="email">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs font-medium text-rose-500">{errors.email.message}</p>}
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
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

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#F97316] dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>{t('back')}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
