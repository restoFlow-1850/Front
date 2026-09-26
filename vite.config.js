import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_PROXY_TARGET || 'https://backend-production-109c0.up.railway.app'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt'],
        manifest: {
          name: 'RestoFlow — Restoran boshqaruv tizimi',
          short_name: 'RestoFlow',
          description: 'Buyurtmalar, oshxona, kassa, menyu va stollar — bitta ilovada.',
          lang: 'uz',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#FFFFFF',
          theme_color: '#F97316',
          icons: [
            { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Faqat statik build fayllari precache qilinadi — API ma'lumotlari
          // hech qachon cache'lanmaydi (kassa/oshxona doim yangi ma'lumot ko'rsin).
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@utils': path.resolve(__dirname, 'src/features/cashier/utils'),
        '@components': path.resolve(__dirname, 'src/features/cashier/components'),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
                return 'vendor-apexcharts'
              }
              if (id.includes('exceljs')) {
                return 'vendor-exceljs'
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf-canvas'
              }
              if (id.includes('@tanstack') || id.includes('@reduxjs') || id.includes('react-redux')) {
                return 'vendor-state-query'
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons'
              }
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: backendTarget, changeOrigin: true, secure: false },
        '/uploads': { target: backendTarget, changeOrigin: true },
        '/socket.io': { target: backendTarget, changeOrigin: true, ws: true },
      },
    },
  }
})
