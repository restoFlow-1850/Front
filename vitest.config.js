import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // e2e/ — Playwright testlari (npm run test:e2e), vitest ularni ishga tushirmasin
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
