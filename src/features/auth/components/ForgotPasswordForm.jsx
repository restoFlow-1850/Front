import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api'

const schema = z.object({
  email: z.string().email('Email noto‘g‘ri'),
})

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    setMessage(null)
    setError(null)
    try {
      await authApi.forgotPassword(values)
      setMessage('Agar bu email mavjud bo‘lsa, sizga ko‘rsatmalarga ega xabar yuboriladi.')
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <label>
        Email
        <input type="email" placeholder="siz@gmail.com" autoComplete="email" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </label>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        Parolni tiklash
      </button>
    </form>
  )
}
