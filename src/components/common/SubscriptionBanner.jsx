// "Obuna tugagan" banneri — 402 (SUBSCRIPTION_EXPIRED) kelganda AppLayout tepasida chiqadi.
//
// Axios interceptor lib/subscription.js orqali hodisani e'lon qiladi; shu komponent
// tinglaydi va foydalanuvchiga obuna tugaganini aytadi. GET so'rovlari ishlayveradi,
// shuning uchun panel yopilmaydi — faqat yozuv amallari (buyurtma, to'lov) to'xtaydi.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleAlert, LuX } from 'react-icons/lu'
import { onSubscriptionExpired } from '../../lib/subscription'

export default function SubscriptionBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => onSubscriptionExpired(() => setVisible(true)), [])

  if (!visible) return null

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-red-900 shadow-2xs dark:border-red-500/40 dark:bg-red-950/60 dark:text-red-100"
    >
      <LuCircleAlert className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">
          {t('subscription.expiredTitle', { defaultValue: 'Obuna tugagan' })}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">
          {t('subscription.expiredBody', {
            defaultValue:
              "Yozuv amallari (buyurtma ochish, to'lov) to'xtatildi. Obunani to'lang yoki administratorga murojaat qiling.",
          })}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-200"
        aria-label={t('close', { defaultValue: 'Yopish' })}
      >
        <LuX className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
