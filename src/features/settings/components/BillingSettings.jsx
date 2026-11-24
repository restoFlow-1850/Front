import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleAlert, LuRefreshCw } from 'react-icons/lu'
import { settingsApi } from '../api'
import { extendSubscriptionForDisplay } from '../../../lib/subscription'
import styles from '../pages/SettingsPage.module.css'

const statusTone = {
  active: 'statusSuccess',
  trial: 'statusSuccess',
  expired: 'statusError',
  unknown: '',
}

const statusLabelKey = {
  active: 'subscription.statusActive',
  trial: 'subscription.statusTrial',
  expired: 'subscription.statusExpired',
  unknown: 'subscription.statusUnknown',
}

export default function BillingSettings() {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setStatus(await settingsApi.getBillingStatus())
    } catch {
      setError(t('subscription.statusLoadError', { defaultValue: 'Obuna holatini yuklab bo‘lmadi.' }))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const currentStatus = status?.status ?? 'unknown'
  const displayStatus = extendSubscriptionForDisplay(status)
  const daysLeft = displayStatus?.daysLeft
  const endsAt = displayStatus?.endsAt
    ? new Intl.DateTimeFormat(i18n.language || 'uz', { dateStyle: 'medium' }).format(new Date(displayStatus.endsAt))
    : null

  return (
    <section className={styles.section}>
      <div className={styles.sectionCopy}>
        <p className={styles.sectionEyebrow}>RestoFlow</p>
        <h2 className={styles.sectionTitle}>{t('subscription.statusTitle', { defaultValue: 'Obuna holati' })}</h2>
        <p className={styles.sectionDescription}>{t('subscription.statusDesc', { defaultValue: 'Sinov muddati va obuna holatini shu yerda ko‘ring.' })}</p>
      </div>
      <div className={styles.sectionBody}>
        {error && (
          <div className={styles.alert} role="alert">
            <span>{error}</span>
            <button type="button" className={styles.retryButton} onClick={load}>{t('refresh', { defaultValue: 'Qayta urinish' })}</button>
          </div>
        )}

        {currentStatus === 'expired' && (
          <div className={styles.alert} role="status">
            <LuCircleAlert size={18} aria-hidden="true" />
            <span>{t('subscription.expiredHint', { defaultValue: 'Buyurtma ochish va to‘lov bloklangan. Obunani to‘lang yoki administratorga murojaat qiling.' })}</span>
          </div>
        )}

        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.label}>{t('subscription.statusLabel', { defaultValue: 'Holat' })}</span>
            <div>
              <span className={`${styles.status} ${statusTone[currentStatus] ? styles[statusTone[currentStatus]] : ''}`}>
                {loading ? t('loading', { defaultValue: 'Yuklanmoqda...' }) : t(statusLabelKey[currentStatus])}
              </span>
            </div>
          </div>

          {daysLeft !== null && daysLeft !== undefined && (
            <div className={styles.field}>
              <span className={styles.label}>{t('subscription.daysLeftLabel', { defaultValue: 'Qolgan kunlar' })}</span>
              <p className={styles.helper}>{t('subscription.daysLeft', { count: daysLeft, defaultValue: '{{count}} kun qoldi' })}</p>
            </div>
          )}

          {endsAt && (
            <div className={styles.field}>
              <span className={styles.label}>{t('subscription.endsAtLabel', { defaultValue: 'Tugash sanasi' })}</span>
              <p className={styles.helper}>{endsAt}</p>
            </div>
          )}
        </div>

        <button type="button" className={styles.retryButton} onClick={load} disabled={loading}>
          <LuRefreshCw size={14} aria-hidden="true" /> {t('subscription.refreshStatus', { defaultValue: 'Holatni yangilash' })}
        </button>
      </div>
    </section>
  )
}
