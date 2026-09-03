// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './tableStore';
import cartReducer from './cartStore';
import orderReducer from '../services/order.service';
import reservationReducer from './reservationStore';

export const store = configureStore({
  reducer: {
    tables: tableReducer,
    cart: cartReducer,
    orders: orderReducer,
    reservations: reservationReducer,
  },
});

