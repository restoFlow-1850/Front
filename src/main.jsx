import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './i18n'
import './index.css'

import { store } from './app/store'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import FullPageLoader from './components/common/FullPageLoader'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

// ToastContainer FAQAT shu yerda — ilgari u main.jsx, App.jsx va ToastProvider'da
// uch marta render bo'lardi, natijada bitta toast uch nusxada chiqardi.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<FullPageLoader />}>
            <App />
          </Suspense>
          <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
