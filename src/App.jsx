import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'

import { router } from './app/router'
import { clearSession, isSessionForCurrentApi, readToken } from './features/auth/session'
import { connectSocket } from './services/socket'

export default function App() {
  // Eslatma: useAuthSync (tablar aro logout) Router ichida bo'lishi shart,
  // shuning uchun u AppLayout'da chaqiriladi — bu yerda emas (App Router'dan tashqarida).

  // Sahifa qayta yuklanganda (F5) token localStorage'da qolgan bo'lsa,
  // socket ham qayta ulanishi kerak — aks holda bildirishnomalar tarixi
  // ko'rinadi-yu, lekin yangi real-time xabarlar kelmay qoladi.
  useEffect(() => {
    // Eski backend hostiga tegishli token yangi serverda 401 qaytaradi —
    // bunday sessiyani darhol tozalab, foydalanuvchini qayta login'ga yo'naltiramiz.
    if (!isSessionForCurrentApi()) {
      clearSession()
      return
    }

    const token = readToken('accessToken')
    if (token) connectSocket(token)
  }, [])

  // ToastContainer main.jsx'da bir marta render qilinadi.
  return <RouterProvider router={router} />
}
