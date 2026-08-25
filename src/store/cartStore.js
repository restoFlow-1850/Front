// src/store/slices/cartSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  tableNote: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(item => item.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
        if (action.payload.note) {
          existing.note = action.payload.note;
        }
      } else {
        state.items.push({
          ...action.payload,
          id: `cart-${Date.now()}-${Math.random()}`,
          quantity: action.payload.quantity || 1,
        });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity !== undefined) {
          item.quantity = Math.max(1, action.payload.quantity);
        }
        if (action.payload.note !== undefined) {
          item.note = action.payload.note;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.tableNote = '';
    },
    setTableNote: (state, action) => {
      state.tableNote = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setTableNote,
} = cartSlice.actions;

export default cartSlice.reducer;