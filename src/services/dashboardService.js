import axios from './axios';

// Dashboard va Analitika API'lari
export const getDashboardStats = () => axios.get('/reports/dashboard');
export const getDailySales = () => axios.get('/reports/daily-sales');
export const getTopProducts = () => axios.get('/reports/top-products');