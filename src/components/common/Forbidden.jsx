// Ruxsat yo'q sahifasi — rol mos kelmaganda ProtectedRoute shu yerga yo'naltiradi.
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Forbidden() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-paper px-4 text-center dark:bg-ink">
      <ShieldAlert size={40} className="text-cherry" />
      <p className="font-display text-xl text-charcoal dark:text-fog">
        {t('auth.accessDenied')}
      </p>
      <Link to="/" className="text-sm font-medium text-ember hover:underline">
        {t('nav.dashboard')}
      </Link>
    </div>
  )
}
