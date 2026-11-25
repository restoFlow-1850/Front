import api from './axios'

// Dashboard va Analitika API'lari
// Backend'dagi yagona umumiy hisobot manbasi — GET /reports.
// /reports/dashboard eski/yo'q endpoint bo'lib, 401/404 bergan — ishlatilmaydi.
export const getReports = (params) => api.get('/reports', { params })
export const getDashboardStats = (params) => getReports(params)
export const getDailySales = (params) => api.get('/reports/daily-sales', { params })
export const getTopProducts = (params) => api.get('/reports/top-products', { params })
