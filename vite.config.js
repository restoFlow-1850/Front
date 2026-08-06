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
})
