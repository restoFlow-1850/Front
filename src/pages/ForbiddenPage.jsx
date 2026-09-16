// 403 — foydalanuvchi tizimga kirgan, lekin bu sahifa uning roliga ochiq emas.
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShieldAlert } from 'lucide-react'

import { ROLE_HOME, ROLE_LABELS } from '../constants/roles'
import { readUser } from '../features/auth/session'

export default function ForbiddenPage() {
  const user = useSelector((state) => state.auth.user) || readUser()
  const home = (user?.role && ROLE_HOME[user.role]) ? ROLE_HOME[user.role] : '/'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="h-14 w-14 text-amber-500" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ruxsat yo'q</h1>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Bu sahifa <strong>{ROLE_LABELS[user?.role] ?? user?.role}</strong> roli uchun ochiq emas.
          Kerak bo'lsa administratordan ruxsat so'rang.
        </p>
      </div>
      <Link
        to={home}
        className="rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
      >
        O'z panelimga qaytish
      </Link>
    </div>
  )
}
