import { defineConfig, devices } from '@playwright/test'

// E2E: Front (vite preview) + Backend (Node) + MongoDB — hammasi lokal.
// Backend va seed'ni ishga tushirish: e2e/README.md
const FRONT_PORT = Number(process.env.E2E_FRONT_PORT || 4173)
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: false, // bitta umumiy baza — testlar ketma-ket
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${FRONT_PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    locale: 'uz-UZ',
    timezoneId: 'Asia/Tashkent',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Oldindan o'rnatilgan Chromium bo'lsa (masalan, sandbox) — shuni ishlat
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    // Build E2E_API_URL bilan oldindan qilingan bo'lishi kerak (CI shunday qiladi)
    command: `npm run preview -- --port ${FRONT_PORT} --strictPort`,
    url: `http://localhost:${FRONT_PORT}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
})
