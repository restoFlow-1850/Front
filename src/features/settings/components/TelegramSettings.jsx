// Telegram bildirishnomalari bo'limi — har bir restoran o'z chatiga xabar oladi.
//
// GET/PUT /api/clients/:id (admin/manager) orqali saqlanadi; asosiy Settings
// formasi (/settings) dan alohida, shuning uchun saqlash ham alohida tugma.
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSave } from 'react-icons/lu'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/ui/Button'
import api from '../../../services/axios'
import { apiErrorMessage } from '../../../lib/api'
import { readUser } from '../../auth/session'
import styles from '../pages/SettingsPage.module.css'

const EVENT_KEYS = ['cancellation', 'low_stock', 'shift_close']

const EVENT_LABEL_KEY = {
  cancellation: 'subscription.eventCancellation',
  low_stock: 'subscription.eventLowStock',
  shift_close: 'subscription.eventShiftClose',
}

const defaultTelegram = {
  chatId: '',
  enabled: false,
  events: ['cancellation', 'low_stock', 'shift_close'],
  largeCancelThreshold: 200000,
}

function FieldError({ message }) {
  return message ? <span className={styles.error} role="alert">{message}</span> : null
}

export default function TelegramSettings() {
  const { t } = useTranslation()
  const reduxUser = useSelector((state) => state.auth.user)
  const user = reduxUser || readUser()
  const client = user?.restaurant ?? user?.restaurant?._id ?? null

  const [telegram, setTelegram] = useState(defaultTelegram)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [chatIdError, setChatIdError] = useState('')

  const load = useCallback(async () => {
    if (!client) return
    setLoadError('')
    try {
      const res = await api.get(`/clients/${client}`)
      const data = res?.data?.data ?? {}
      const tg = data.telegram ?? {}
      setTelegram({
        chatId: tg.chatId ?? '',
        enabled: Boolean(tg.enabled),
        events: Array.isArray(tg.events) && tg.events.length ? tg.events : defaultTelegram.events,
        largeCancelThreshold: tg.largeCancelThreshold ?? 200000,
      })
    } catch (error) {
      setLoadError(apiErrorMessage(error, t('subscription.telegramSaveError')))
    }
  }, [client, t])

  useEffect(() => {
    load()
  }, [load])

  const toggleEvent = (key) => {
    setTelegram((prev) => ({
      ...prev,
      events: prev.events.includes(key)
        ? prev.events.filter((event) => event !== key)
        : [...prev.events, key],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const chatId = telegram.chatId.trim()
    if (telegram.enabled && !chatId) {
      setChatIdError(t('subscription.noChatIdWarning'))
      return
    }
    if (chatId && !/^-?\d{5,64}$/.test(chatId)) {
      setChatIdError(t('subscription.chatIdHelp'))
      return
    }

    setChatIdError('')
    setSaving(true)
    try {
      await api.put(`/clients/${client}`, {
        telegram: {
          chatId: chatId || null,
          enabled: telegram.enabled,
          events: telegram.events,
          largeCancelThreshold: Number(telegram.largeCancelThreshold) || 200000,
        },
      })
      toast.success(t('subscription.telegramSaved'))
    } catch (error) {
      toast.error(apiErrorMessage(error, t('subscription.telegramSaveError')))
    } finally {
      setSaving(false)
    }
  }

  if (!client) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionCopy}>
          <p className={styles.sectionEyebrow}>Telegram</p>
          <h2 className={styles.sectionTitle}>{t('subscription.telegram')}</h2>
        </div>
        <div className={styles.sectionBody}>
          <p className={styles.helper}>{t('subscription.noChatIdWarning')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionCopy}>
        <p className={styles.sectionEyebrow}>Telegram</p>
        <h2 className={styles.sectionTitle}>{t('subscription.telegram')}</h2>
        <p className={styles.sectionDescription}>{t('subscription.telegramDesc')}</p>
      </div>
      <div className={styles.sectionBody}>
        {loadError && (
          <div className={styles.alert} role="alert">
            <span>{loadError}</span>
            <button type="button" className={styles.retryButton} onClick={load}>{t('refresh', { defaultValue: 'Qayta urinish' })}</button>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGrid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="tg-chat-id">{t('subscription.chatId')}</label>
              <input
                id="tg-chat-id"
                className={styles.input}
                value={telegram.chatId}
                aria-invalid={Boolean(chatIdError)}
                onChange={(event) => setTelegram((prev) => ({ ...prev, chatId: event.target.value }))}
                placeholder="-1001234567890"
                inputMode="numeric"
              />
              <span className={styles.helper}>{t('subscription.chatIdHelp')}</span>
              <FieldError message={chatIdError} />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="tg-threshold">{t('subscription.threshold')} (so‘m)</label>
              <input
                id="tg-threshold"
                className={styles.input}
                type="number"
                min="0"
                step="1000"
                value={telegram.largeCancelThreshold}
                onChange={(event) => setTelegram((prev) => ({ ...prev, largeCancelThreshold: event.target.value }))}
              />
              <span className={styles.helper}>{t('subscription.thresholdHelp')}</span>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={telegram.enabled}
                  onChange={(event) => setTelegram((prev) => ({ ...prev, enabled: event.target.checked }))}
                />{' '}
                {t('subscription.enabled')}
              </label>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>{t('subscription.events')}</span>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {EVENT_KEYS.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={telegram.events.includes(key)}
                      onChange={() => toggleEvent(key)}
                    />
                    {t(EVENT_LABEL_KEY[key])}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" className={styles.actionButton} isLoading={saving}>
              <LuSave size={16} aria-hidden="true" /> {t('save', { defaultValue: 'Saqlash' })}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
