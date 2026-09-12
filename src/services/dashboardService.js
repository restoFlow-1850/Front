import api from './axios'

// Dashboard va Analitika API'lari
export const getDashboardStats = () => api.get('/reports/dashboard')
export const getDailySales = (params) => api.get('/reports/daily-sales', { params })
export const getTopProducts = (params) => api.get('/reports/top-products', { params })
export const getReports = (params) => api.get('/reports', { params })