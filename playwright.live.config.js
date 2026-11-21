import { defineConfig, devices } from '@playwright/test'

// Jonli (yoki staging) saytni tekshirish: E2E_BASE_URL=https://restoflow.uz npx playwright test -c playwright.live.config.js
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/buttons-audit.spec.js',
  workers: 1,
  timeout: 150_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://restoflow.uz',
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
    screenshot: 'only-on-failure',
    locale: 'uz-UZ',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {} } }],
})
