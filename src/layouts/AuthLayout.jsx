// Auth layout — login/register sahifalari uchun (sidebar'siz).
// Mas'ul: Ziyodulla.
import { Outlet } from 'react-router-dom'
import { ChefHat } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-4 dark:bg-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-gold text-ink">
            <ChefHat size={22} strokeWidth={2.25} />
          </span>
          <span className="font-display text-2xl tracking-wide text-charcoal dark:text-fog">
            RestoFlow
          </span>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-ink-border dark:bg-ink-2">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
