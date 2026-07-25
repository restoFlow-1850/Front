// Asosiy layout — sidebar/navbar olib tashlandi, sahifa to'liq kenglikda ishlaydi.
// Mas'ul: Ziyodulla.
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-paper text-charcoal dark:bg-ink dark:text-fog">
      <Outlet />
    </div>
  )
}
