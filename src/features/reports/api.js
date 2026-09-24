// Reports API — Hisobotlar va analitika ma'lumotlarini olish
import api from '../../services/axios'

/** Dashboard umumiy hisoboti — GET /api/reports/dashboard */
export const getDashboardReport = () => api.get('/reports/dashboard')

/** Kunlik savdo hisoboti — GET /api/reports/daily-sales */
export const getDailySalesReport = (params) => api.get('/reports/daily-sales', { params })

/** Eng ko'p sotilgan taomlar — GET /api/reports/top-products */
export const getTopProductsReport = (params) => api.get('/reports/top-products', { params })

/** Barcha buyurtmalar ro'yxati (analitika uchun) — GET /api/orders */
export const getAnalyticsOrders = (params) => api.get('/orders', { params })

/** Barcha to'lovlar ro'yxati (analitika uchun) — GET /api/payments */
export const getAnalyticsPayments = (params) => api.get('/payments', { params })

/** Barcha taomlar (kam sotilganlar taqqosi uchun) — GET /api/products */
export const getAnalyticsProducts = (params) => api.get('/products', { params })

/** Telegram botga kunlik hisobotni yuborish — POST /api/reports/telegram-daily-report */
export const sendTelegramDailyReport = () => api.post('/reports/telegram-daily-report')
