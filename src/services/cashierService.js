import axios from './axios';

// Kassa va Chek API'lari
export const getReceipt = (orderId) => axios.get(`/orders/${orderId}/receipt`);
export const processPayment = (paymentData) => axios.post('/payments', paymentData);
export const getPaymentsList = () => axios.get('/payments');