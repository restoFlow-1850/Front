// Asosiy layout — sidebar + navbar + kontent.
// Mas'ul: Ziyoddila.
import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
// import Sidebar from '../components/common/Sidebar'
// import Navbar from '../components/common/Navbar'

export default function AppLayout() {
  return (
    <div className="app-layout">
      {/* <Sidebar /> */}
      <div className="app-main">
        {/* <Navbar /> */}
        <main className="app-content">
          <Suspense fallback={<div className="p-6 text-center text-gray-400">Yuklanmoqda...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
