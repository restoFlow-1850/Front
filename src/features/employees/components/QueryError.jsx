import { useTranslation } from 'react-i18next'
import { apiErrorMessage } from '../../../lib/api'
import { Button } from '../../../components/ui'

export default function QueryError({ error, onRetry, fallback }) {
  const { t } = useTranslation()
  const status = error?.response?.status
  const upstreamDown = !error?.response || status >= 500
  const message = upstreamDown
    ? t('employees.backendUnavailable', {
        defaultValue: 'Backend vaqtinchalik ishlamayapti. Iltimos, keyinroq qayta urining.',
      })
    : apiErrorMessage(error, fallback || t('employees.loadFailed'))

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('employees.retry', { defaultValue: 'Qayta urinish' })}
        </Button>
      )}
    </div>
  )
}
