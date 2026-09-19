import { useTranslation } from 'react-i18next'
import { FiInbox } from 'react-icons/fi'

export default function EmptyRestaurants() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2a1315]">
        <FiInbox className="h-8 w-8 text-[#8a7373]" />
      </div>
      <h3 className="text-lg font-bold text-[#E6DCDC]">{t('landing.restaurants.emptyTitle')}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#9a8080]">
        {t('landing.restaurants.emptyDesc')}
      </p>
    </div>
  )
}
