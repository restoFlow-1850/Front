import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './i18n'
import './index.css'

import { store } from './app/store'
import { router } from './router'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
    },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={<div className="flex h-screen items-center justify-center">Yuklanmoqda...</div>}>
                    <RouterProvider router={router} />
                </Suspense>
                <Toaster position="top-right" />
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)