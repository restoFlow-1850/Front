// Login sahifasi — oddiy variant.
// Har mas'ul o'z sahifasini shu strukturada yaratadi.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    // Bu test uchun oddiy token saqlaymiz.
    localStorage.setItem('accessToken', 'demo-token')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Kirish</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Elektron pochta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="email@misol.com"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Parol
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="********"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-800"
          >
            Kirish
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Demo uchun istalgan ma'lumotni kiriting va Kirish tugmasini bosing.
        </p>
      </div>
    </div>
  )
}
