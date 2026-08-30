import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  UtensilsCrossed,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
} from 'lucide-react'
import { authApi } from '../api'
import { useTheme } from '../../../hooks/useTheme'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'

const schema = z
  .object({
    name: z.string().min(2, "Ism kamida 2 ta belgi bo'lishi kerak"),
    email: z.string().email("Email noto'g'ri formatda"),
    password: z.string().min(6, "Kamida 6 ta belgi bo'lishi kerak"),
    confirmPassword: z.string().min(6, "Kamida 6 ta belgi bo'lishi kerak"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parollar mos kelmaydi',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    setError(null)
    try {
      await authApi.register({ name: values.name, email: values.email, password: values.password })
      navigate('/otp', { state: { email: values.email }, replace: true })
    } catch (err) {
      setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F17] font-sans transition-colors">
      {/* Top right controls */}
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
      <div className="relative hidden w-[46%] lg:flex lg:flex-col lg:justify-between overflow-hidden p-10 xl:p-14">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85"
            alt="RestoFlow Modern Restaurant"
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17]/95 via-[#0F172A]/90 to-[#1E293B]/85" />
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/15 shadow-xl">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/40">
              <UtensilsCrossed size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Resto<span className="text-[#F97316]">Flow</span>
            </span>
          </div>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 mb-4 backdrop-blur-sm">
            <Sparkles size={13} className="text-orange-400" />
            <span>Restoran tarmog'ingiz uchun bitta tizim</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Yangi hisob yarating va{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              boshqaruvni boshlang
            </span>
          </h1>

          <p className="mt-4 text-sm xl:text-base leading-relaxed text-slate-300">
            Stollar boshqaruvi, buyurtmalar oqimi va xodimlar nazoratini avtomatlashtiring.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-sm font-semibold text-white">14 kun bepul sinov muddati</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-[#F97316]">
                <Clock size={18} />
              </div>
              <span className="text-sm font-semibold text-white">2 daqiqada tezkor sozlash</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
          <span>RestoFlow POS & CRM v2.0</span>
          <span>© 2026 RestoFlow Technologies</span>
        </div>
      </div>

      {/* RIGHT REGISTER FORM */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[460px]">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/40">
              <UtensilsCrossed size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resto<span className="text-[#F97316]">Flow</span>
            </span>
          </div>

          <div className="rounded-[28px] border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-none transition-all">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-[#F97316] mb-3">
                <UserPlus size={14} />
                <span>Yangi foydalanuvchi</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Ro'yxatdan o'tish
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ma'lumotlaringizni kiriting va tizimga a'zo bo'ling.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="name">
                  To'liq ism
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alisher Karimov"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs font-medium text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="register-email">
                  Email manzil
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@misol.uz"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs font-medium text-rose-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="register-password">
                  Parol
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-11 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs font-medium text-rose-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="confirm-password">
                  Parolni tasdiqlang
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C] py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] hover:shadow-orange-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Yuborilmoqda...
                  </span>
                ) : (
                  <span>Ro'yxatdan o'tish</span>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="font-bold text-[#F97316] hover:text-orange-600 transition-colors">
                Kirish
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
