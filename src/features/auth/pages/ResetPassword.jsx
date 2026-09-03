// Parolni tiklash — emaildagi havoladan keladi: /reset-password?token=...
// Backend forgot-password xatida FRONTEND_RESET_URL?token=<raw> ko'rinishida
// yuboradi (Backend/src/services/auth.service.js).
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { authApi } from '../api'
import { apiErrorMessage } from '../../../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    // Backend `password` maydonini kutadi — `newPassword` emas.
    mutationFn: () => authApi.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success('Parol yangilandi. Endi tizimga kirishingiz mumkin.')
      navigate('/login', { replace: true })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Parolni tiklab bo'lmadi")),
  })

  const valid = password.length >= 6 && password === confirm

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F4] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#4A2F37]/10 bg-[#FDF9F6] p-8 shadow-[0_25px_80px_rgba(42,27,34,0.12)]">
        <h1 className="text-2xl font-semibold text-[#2A1B22]">Yangi parol o'rnatish</h1>

        {!token ? (
          <>
            <p className="mt-3 text-sm leading-6 text-[#4A2F37]/70">
              Havola noto'g'ri yoki tiklash tokeni yo'q. Iltimos, parolni tiklashni qaytadan
              boshlang.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-block rounded-2xl bg-[#2A1B22] px-4 py-3 font-semibold text-[#FDF9F6] transition hover:bg-[#4A2F37]"
            >
              Qaytadan urinish
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[#4A2F37]/70">
              Yangi parolni kiriting. Kamida 6 ta belgi bo'lishi kerak.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (valid) mutation.mutate()
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="password">
                  Yangi parol
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="confirm">
                  Parolni tasdiqlang
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
                />
                {confirm && confirm !== password && (
                  <p className="text-sm text-rose-600">Parollar mos kelmadi</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!valid || mutation.isPending}
                className="w-full rounded-2xl bg-[#2A1B22] px-4 py-3 font-semibold text-[#FDF9F6] transition hover:bg-[#4A2F37] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? 'Kuting...' : 'Parolni saqlash'}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-medium text-[#4A2F37] hover:text-[#2A1B22]"
            >
              Kirish sahifasiga qaytish
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
