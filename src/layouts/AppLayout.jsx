// Ilova qobig'i — zamonaviy sidebar (rolga qarab filtrlangan), premium topbar va kontent.
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, LogOut, Menu, User, X, UtensilsCrossed, Sun, Moon, ChevronRight } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { clearCredentials } from '../features/auth/authSlice'
import { clearSession, readUser } from '../features/auth/session'
import { navItemsForRole } from '../constants/navigation'
import { ROLE_LABELS } from '../constants/roles'
import { useNotificationsSocket } from '../features/notifications'
import { useAuthSync } from '../hooks/useAuthSync'
import { useSocketStatus } from '../hooks/useSocketStatus'
import { useTheme } from '../hooks/useTheme'
import { disconnectSocket } from '../services/socket'
import LanguageSwitcher from '../components/common/LanguageSwitcher'

export default function AppLayout() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isSocketConnected = useSocketStatus()
  const { theme, toggleTheme } = useTheme()

  const reduxUser = useSelector((state) => state.auth.user)
  const user = reduxUser || readUser()
  const notifications = useSelector((state) => state.notifications.items)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const [mobileOpen, setMobileOpen] = useState(false)

  useAuthSync()
  useNotificationsSocket()

  const items = useMemo(() => navItemsForRole(user?.role), [user?.role])
  const currentItem = items.find((i) => i.path === location.pathname)

  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = () => {
    disconnectSocket()
    clearSession()
    dispatch(clearCredentials())
    navigate('/login', { replace: true, state: null })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0B0F17] text-white border-r border-slate-800/70 select-none shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0B0F17]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/30">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Resto<span className="text-[#F97316]">Flow</span>
              </span>
              <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-400">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">{t('restaurantManagement')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
          aria-label={t('close')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {t('mainSections')}
        </div>
        {items.map(({ key, path, label, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-850 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition ${
                    isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="truncate">{t(`nav.${key}`, label)}</span>
                {key === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#EA580C] shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card & Logout */}
      <div className="border-t border-slate-800/80 p-4 bg-[#0B0F17]/50">
        <NavLink
          to="/profile"
          className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-2.5 transition-all hover:border-orange-500/30 hover:bg-slate-900"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-sm font-black text-white shadow-md shadow-orange-500/30">
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-white text-sm">
              {user?.name ?? user?.email ?? t('user')}
            </span>
            <span className="inline-block rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-400">
              {user?.role ? t(`roles.${user.role}`, ROLE_LABELS[user.role] ?? user.role) : ''}
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut size={15} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] transition-colors">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-68 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label={t('close')}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-68 lg:hidden">{sidebar}</aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0B0F17]/85 lg:px-7 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Menyuni ochish"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span className="hidden sm:inline">RestoFlow</span>
              <ChevronRight size={14} className="hidden sm:inline text-slate-300 dark:text-slate-600" />
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {currentItem ? t(`nav.${currentItem.key}`, currentItem.label) : t('nav.dashboard')}
              </span>
            </div>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Socket Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                isSocketConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{isSocketConnected ? t('live') : t('disconnected')}</span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher className="border border-slate-200 bg-slate-50/80 shadow-2xs dark:border-slate-800 dark:bg-slate-900" />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title={theme === 'dark' ? t('lightThemeTip') : t('darkThemeTip')}
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span className="hidden md:inline">{t('dark')}</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="hidden md:inline">{t('light')}</span>
                </>
              )}
            </button>

            {/* Notifications Bell */}
            <NavLink
              to="/notifications"
              className="relative flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-[#F97316] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Bildirishnomalar"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#F97316] text-[9px] font-black text-white ring-2 ring-white dark:ring-[#0B0F17] animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* User Avatar */}
            <NavLink
              to="/profile"
              className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:scale-105 transition"
              aria-label="Profil"
            >
              {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </NavLink>
          </div>
        </header>

        {/* Content Area */}
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
