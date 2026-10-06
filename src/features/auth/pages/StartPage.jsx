import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  User,
  Phone,
  Lock,
  Sparkles,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { authApi } from '../api'
import { saveSession } from '../session'

// ─── Validatsiya sxemasi ──────────────────────────────────────────────────────
const schema = z.object({
  restaurantName: z.string().min(2, "Restoran nomi kamida 2 belgidan iborat bo'lishi kerak"),
  ownerName: z.string().min(2, "Egasi ismi kamida 2 belgidan iborat bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqamini to'liq kiriting"),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat'),
})

// ─── Demo ma'lumotlar ─────────────────────────────────────────────────────────
const DEMO_DATA = {
  restaurantName: 'Rayhon Milliy Taomlari',
  ownerName: "Abdug'ani Karimov",
  phone: '+998 90 123 45 67',
  password: 'Demo1234',
}

/**
 * Bitta tranzaksiyada client (admin akkaunti) va restoranni ro'yxatdan o'tkazish.
 *
 * Backend POST /auth/register-restaurant hali mavjud bo'lmaganda:
 *   — 404 yoki network error → demo session bilan davom etiladi.
 *   — 409 Conflict             → foydalanuvchiga xato ko'rsatiladi (haqiqiy xato).
 *   — boshqa HTTP xatolar      → xabar ko'rsatiladi.
 */
async function registerClientAndAdmin({ restaurantName, ownerName, phone, password }) {
  try {
    const res = await authApi.registerRestaurant({ restaurantName, ownerName, phone, password })
    return {
      ok: true,
      data: res?.data ?? null,
      usedFallback: false,
    }
  } catch (err) {
    const status = err?.response?.status

    // Haqiqiy xato: bu telefon/restoran avval ro'yxatdan o'tgan
    if (status === 409) {
      throw Object.assign(new Error("Bu telefon raqami yoki restoran allaqachon ro'yxatdan o'tgan"), {
        isConflict: true,
      })
    }

    // Backend endpoint yo'q (404) yoki server ishlamayapti — demo rejim
    // Demo rejimida OTP bosqichiga o'tiladi, u yerda ham fallback ishlaydi
    if (!status || status === 404 || status === 0) {
      console.warn('[StartPage] Backend /auth/register-restaurant mavjud emas — demo rejim faollashtirildi')
      return { ok: true, data: null, usedFallback: true }
    }

    // Boshqa xatolik — tashqariga chiqaramiz
    throw err
  }
}

export default function StartPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('register') // 'register' | 'otp'
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(null)
  const [usedFallback, setUsedFallback] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { restaurantName: '', ownerName: '', phone: '+998 90 ', password: '' },
  })

  const handleFillDemo = () => {
    setValue('restaurantName', DEMO_DATA.restaurantName)
    setValue('ownerName', DEMO_DATA.ownerName)
    setValue('phone', DEMO_DATA.phone)
    setValue('password', DEMO_DATA.password)
  }

  // ─── 1-qadam: Ro'yxatdan o'tish ──────────────────────────────────────────
  const onSubmitRegister = async (values) => {
    setError(null)
    try {
      const result = await registerClientAndAdmin(values)
      setFormData(values)
      setUsedFallback(result.usedFallback)
      setStep('otp')
    } catch (err) {
      if (err.isConflict) {
        setError(err.message)
      } else {
        setError(err?.response?.data?.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi. Qayta urinib ko'ring.")
      }
    }
  }

  // ─── 2-qadam: OTP tasdiqlash + admin session saqlash ─────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length < 4) {
      setError('4 xonali OTP kodni kiriting (Demo uchun: 1234)')
      return
    }
    setError(null)

    let sessionData = null

    if (!usedFallback) {
      // Backend mavjud — haqiqiy OTP tekshirish
      try {
        const res = await authApi.verifyOtp({ phone: formData.phone, code: otpCode })
        if (res?.data) {
          sessionData = {
            user: res.data.user ?? { name: formData.ownerName, role: 'admin' },
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          }
        }
      } catch (err) {
        const status = err?.response?.status
        if (status === 400 || status === 422) {
          setError('OTP kod noto\'g\'ri yoki muddati o\'tgan')
          return
        }
        // OTP endpoint ham yo'q bo'lsa — demo fallback
        console.warn('[StartPage] OTP endpoint mavjud emas — demo session faollashtirildi')
      }
    }

    // Fallback yoki backend token bermasa — demo admin session
    if (!sessionData) {
      sessionData = {
        user: { name: formData.ownerName, role: 'admin' },
        accessToken: `demo-access-${Date.now()}`,
        refreshToken: `demo-refresh-${Date.now()}`,
      }
    }

    // Admin sessiyasini saqlash (bitta tranzaksiya: client + admin)
    saveSession(sessionData)

    // Sehrgar boshlang'ich holati
    localStorage.setItem('restoflow_onboarding_step', '1')
    localStorage.setItem(
      'restoflow_onboarding_data',
      JSON.stringify({
        name: formData.restaurantName,
        phone: formData.phone,
        owner: formData.ownerName,
      }),
    )

    navigate('/quick-setup')
  }

  return (
    <div className="min-h-screen bg-[#140a0b] text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C89B5E] to-[#a0763c] text-[#1e1112] shadow-lg shadow-[#C89B5E]/20">
            <UtensilsCrossed size={24} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Resto<span className="text-[#C89B5E]">Flow</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Restoranni 10 Daqiqada Ishga Tushiring
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Restoran egasi va admin akkaunti — bitta qadamda ro&apos;yxatdan o&apos;tkazish
        </p>
      </div>

      {/* Karta */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#1e1112] py-8 px-4 shadow-2xl border border-[#C89B5E]/30 sm:rounded-2xl sm:px-10">

          {/* Demo to'ldirish banneri */}
          <div className="mb-6 flex items-center justify-between bg-[#C89B5E]/10 border border-[#C89B5E]/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C89B5E]">
              <Sparkles className="w-4 h-4" />
              <span>Tezkor sinov rejimi</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-[#C89B5E] hover:underline flex items-center gap-1"
            >
              1-Click Demo ma&apos;lumotlar
            </button>
          </div>

          {step === 'register' ? (
            /* ── Ro'yxatdan o'tish formasi ── */
            <form onSubmit={handleSubmit(onSubmitRegister)} className="space-y-4">
              {/* Restoran nomi */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Restoran Nomi <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Masalan: Rayhon Milliy Taomlari"
                    className="w-full rounded-xl border border-gray-800 bg-[#140a0b] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-gray-500 outline-none focus:border-[#C89B5E] focus:ring-2 focus:ring-[#C89B5E]/20"
                    {...register('restaurantName')}
                  />
                </div>
                {errors.restaurantName && (
                  <p className="mt-1 text-xs text-red-400">{errors.restaurantName.message}</p>
                )}
              </div>

              {/* Ega ismi */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Restoran Egasining Ismi <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Alisher Karimov"
                    className="w-full rounded-xl border border-gray-800 bg-[#140a0b] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-gray-500 outline-none focus:border-[#C89B5E] focus:ring-2 focus:ring-[#C89B5E]/20"
                    {...register('ownerName')}
                  />
                </div>
                {errors.ownerName && (
                  <p className="mt-1 text-xs text-red-400">{errors.ownerName.message}</p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Telefon Raqami <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-xl border border-gray-800 bg-[#140a0b] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-gray-500 outline-none focus:border-[#C89B5E] focus:ring-2 focus:ring-[#C89B5E]/20"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                )}
              </div>

              {/* Parol */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Admin Paroli <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-800 bg-[#140a0b] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-gray-500 outline-none focus:border-[#C89B5E] focus:ring-2 focus:ring-[#C89B5E]/20"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Nima bo'ladi info qutisi */}
              <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300/90">
                  Ro&apos;yxatdan o&apos;tish bilan{' '}
                  <strong>restoran va admin akkaunti bitta tranzaksiyada</strong> yaratiladi.
                  Keyin 5-qadamli sehrgar orqali menyu, stollar va xodimlarni sozlaysiz.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C89B5E] hover:bg-[#b08449] disabled:opacity-60 py-3 text-sm font-bold text-[#1e1112] shadow-lg transition-all"
              >
                <span>{isSubmitting ? 'Yuklanmoqda...' : 'Davom etish (OTP Kod olish)'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* ── OTP tasdiqlash formasi ── */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="inline-flex p-3 rounded-full bg-[#C89B5E]/20 text-[#C89B5E] mb-2">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">Telefon raqamni tasdiqlash</h3>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="font-semibold text-white">{formData?.phone}</span> raqamiga
                  yuborilgan 4 xonali kodni kiriting
                  {usedFallback && <span className="text-[#C89B5E]"> (Demo rejim: 1234)</span>}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1 text-center">
                  SMS OTP Kod
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="1234"
                    className="w-full text-center tracking-[8px] text-lg font-extrabold rounded-xl border border-gray-800 bg-[#140a0b] py-2.5 pl-8 pr-4 text-white placeholder-gray-600 outline-none focus:border-[#C89B5E] focus:ring-2 focus:ring-[#C89B5E]/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400 text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('register'); setError(null) }}
                  className="w-1/3 rounded-xl border border-gray-800 py-3 text-xs font-bold text-gray-400 hover:bg-gray-800"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-[#C89B5E] hover:bg-[#b08449] py-3 text-sm font-bold text-[#1e1112] shadow-lg transition-all"
                >
                  <span>Tasdiqlash &amp; Sehrgarga O&apos;tish</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-gray-800 pt-4 text-center text-xs font-medium text-gray-400">
            Mavjud hisobingiz bormi?{' '}
            <Link to="/login" className="font-bold text-[#C89B5E] hover:underline">
              Tizimga kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
