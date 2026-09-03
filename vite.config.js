import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
      '/api': {
        target: 'https://backend-production-109c0.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
