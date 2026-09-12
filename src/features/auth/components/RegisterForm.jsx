import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { authApi, getAuthErrorMessage } from '../api'

const schema = z.object({
  name: z.string().min(2, 'Ism kamida 2 ta belgi bo‘lishi kerak'),
  email: z.string().email('Email noto‘g‘ri'),
  password: z.string().min(6, 'Kamida 6 ta belgi bo‘lishi kerak'),
})

const schemaWithPhone = schema.extend({
  phone: z.string().min(9, "Telefon raqami kamida 9 ta belgidan iborat bo'lishi kerak"),
})

export default function RegisterForm() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schemaWithPhone),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  })

  const onSubmit = async (values) => {
    setError(null)
    try {
      await authApi.register(values)
      navigate('/login', { replace: true })
    } catch (err) {
      if (err.response?.status === 409) {
        setError(getAuthErrorMessage(err, "Ro'yxatdan o'tishda xatolik yuz berdi"))
        return
      }
      setError(err.response?.data?.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="name">
          Ism
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-rose-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="register-phone">
          Telefon raqam
        </label>
        <input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
          {...register('phone')}
        />
        {errors.phone && <p className="text-sm text-rose-600">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#4A2F37]" htmlFor="register-password">
          Parol
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-2xl border border-[#4A2F37]/15 bg-[#FAF7F4] px-4 py-3 text-[#2A1B22] shadow-sm outline-none transition focus:border-[#4A2F37] focus:ring-4 focus:ring-[#4A2F37]/10"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
      </div>

      {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#2A1B22] px-4 py-3 font-semibold text-[#FDF9F6] shadow-lg shadow-[#2A1B22]/20 transition hover:-translate-y-0.5 hover:bg-[#4A2F37] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Yuborilmoqda...' : 'Ro‘yxatdan o‘tish'}
      </button>
    </form>
  )
}
