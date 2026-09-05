// Profil — foydalanuvchi ma'lumotlari va parolni o'zgartirish.
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { KeyRound, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { authApi } from '../api'
import { clearSession } from '../session'
import { clearCredentials } from '../authSlice'
import { disconnectSocket } from '../../../services/socket'
import { apiErrorMessage } from '../../../lib/api'
import { ROLE_LABELS } from '../../../constants/roles'
import { Badge, Button, Card, Input, PageHeader, Skeleton } from '../../../components/ui'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await authApi.getMe()
      return res.data?.data?.user ?? res.data?.data ?? res.data
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword({ oldPassword, newPassword }),
    onSuccess: () => {
      toast.success('Parol yangilandi. Iltimos, qaytadan kiring.')
      disconnectSocket()
      clearSession()
      dispatch(clearCredentials())
      navigate('/login', { replace: true })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Parolni o'zgartirib bo'lmadi")),
  })

  const handleLogout = () => {
    disconnectSocket()
    clearSession()
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  const passwordsMatch = newPassword.length >= 6 && newPassword === confirmPassword
  const canSubmit = oldPassword.length > 0 && passwordsMatch

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profil" subtitle="Hisob ma'lumotlaringiz va xavfsizlik sozlamalari" />

      <div className="space-y-5">
        <Card>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {(user?.name ?? '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="info">{ROLE_LABELS[user?.role] ?? user?.role}</Badge>
                    <Badge variant={user?.isActive ? 'success' : 'neutral'}>
                      {user?.isActive ? 'Faol' : 'Faol emas'}
                    </Badge>
                  </div>
                </div>
              </div>

              <dl className="space-y-2 text-sm">
                <InfoRow icon={Mail} label="Email" value={user?.email} />
                <InfoRow icon={Phone} label="Telefon" value={user?.phone || '—'} />
                <InfoRow icon={User} label="Ism" value={user?.name} />
                <InfoRow
                  icon={ShieldCheck}
                  label="Rol"
                  value={ROLE_LABELS[user?.role] ?? user?.role}
                />
              </dl>
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <KeyRound className="h-4 w-4" /> Parolni o'zgartirish
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Parol almashtirilgach barcha qurilmalardagi sessiyalar tugatiladi.
          </p>

          <div className="space-y-3">
            <Input
              label="Joriy parol"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <Input
              label="Yangi parol"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={
                newPassword && newPassword.length < 6
                  ? "Kamida 6 ta belgi bo'lishi kerak"
                  : undefined
              }
            />
            <Input
              label="Yangi parolni tasdiqlang"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword && confirmPassword !== newPassword
                  ? 'Parollar mos kelmadi'
                  : undefined
              }
            />
            <Button
              disabled={!canSubmit}
              isLoading={changePasswordMutation.isPending}
              onClick={() => changePasswordMutation.mutate()}
            >
              Parolni yangilash
            </Button>
          </div>
        </Card>

        <Card>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Hisobdan chiqish
          </Button>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <dt className="w-24 shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-slate-900 dark:text-white">{value}</dd>
    </div>
  )
}