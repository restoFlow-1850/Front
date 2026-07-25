// Ilova darajasidagi provayderlar — Redux, i18n, mavzu, router, toast.
// Mas'ul: Ziyodulla (infra). Har feature o'z sliceni store.js ga qo'shadi.
import { Suspense } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { router } from './router'
import { ThemeProvider } from '../context/ThemeContext'
import '../lib/i18n'

function FullscreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper dark:bg-ink">
      <div className="size-8 animate-spin rounded-full border-2 border-ember border-t-transparent" />
    </div>
  )
}

export default function Providers() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Suspense fallback={<FullscreenLoader />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </ThemeProvider>
    </Provider>
  )
}
