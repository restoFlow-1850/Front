import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './axios';

const DEMO_TOKEN = 'demo-token';

const isDemoMode = () => localStorage.getItem('accessToken') === DEMO_TOKEN;

const sampleOrders = [];

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (data) => {
    if (isDemoMode()) {
      const newOrder = { ...data, id: `order-${Date.now()}`, createdAt: new Date().toISOString() };
      sampleOrders.unshift(newOrder);
      return newOrder;
    }

    const response = await api.post('/orders', data);
    return response.data;
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async () => {
    if (isDemoMode()) {
      return sampleOrders;
    }
    const response = await api.get('/orders');
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Buyurtma yuborishda xatolik';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export default orderSlice.reducer;