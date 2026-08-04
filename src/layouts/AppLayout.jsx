// Ilova qobig'i — sidebar (rolga qarab filtrlangan), topbar va kontent.
// Menyu bandlari constants/navigation.js dan olinadi (marshrutlar bilan bir manba).
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, LogOut, Menu, User, X } from 'lucide-react'

import { clearCredentials } from '../features/auth/authSlice'
import { clearSession } from '../features/auth/session'
import { navItemsForRole } from '../constants/navigation'
import { ROLE_LABELS } from '../constants/roles'
import { useNotificationsSocket } from '../features/notifications'
import { useAuthSync } from '../hooks/useAuthSync'
import { disconnectSocket } from '../services/socket'

export default function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const notifications = useSelector((state) => state.notifications.items)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const [mobileOpen, setMobileOpen] = useState(false)

  useAuthSync() // tablar aro logout sinxronlash
  useNotificationsSocket() // real-time bildirishnomalar

  const items = useMemo(() => navItemsForRole(user?.role), [user?.role])

  // Sahifa almashganda mobil menyu ochiq qolib ketmasin.
  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = () => {
    disconnectSocket()
    clearSession()
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="text-lg font-bold tracking-tight text-white">
          Resto<span className="text-indigo-400">Flow</span>
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="text-slate-400 hover:text-white lg:hidden"
          aria-label="Menyuni yopish"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ key, path, label, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{label}</span>
            {key === 'notifications' && unreadCount > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <NavLink
          to="/profile"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-white">
              {user?.name ?? user?.email ?? 'Foydalanuvchi'}
            </span>
            <span className="block truncate text-xs text-slate-400">
              {ROLE_LABELS[user?.role] ?? user?.role}
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-rose-600/20 hover:text-rose-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Chiqish
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 lg:block">{sidebar}</aside>

      {/* Mobil sidebar */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Menyuni yopish"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 lg:hidden">{sidebar}</aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {items.find((i) => i.path === location.pathname)?.label ?? 'RestoFlow'}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <NavLink
              to="/notifications"
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Bildirishnomalar"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </NavLink>
            <NavLink
              to="/profile"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Profil"
            >
              <User className="h-5 w-5" />
            </NavLink>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}