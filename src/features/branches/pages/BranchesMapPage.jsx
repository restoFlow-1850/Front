import { useTranslation } from 'react-i18next'
import PageHeader from '../../../components/ui/PageHeader'
import RestaurantMapCard from '../components/RestaurantMapCard'

export default function BranchesMapPage() {
  const { t } = useTranslation()

  return (
    <div>
      <PageHeader
        title={t('branchesMap.title', 'Filiallar Xaritasi')}
        subtitle={t(
          'branchesMap.subtitle',
          "Restoran filiallarining joylashuvi va stol bandlik holati faqat Admin uchun",
        )}
      />
      <RestaurantMapCard />
    </div>
  )
}