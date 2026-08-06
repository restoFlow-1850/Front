// src/features/tables/hooks/useCart.js
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setTableNote,
} from '../store/cartStore';

const sampleMenu = [
  { id: 'm1', name: 'Palov', price: 42000, category: 'main', available: true },
  { id: 'm2', name: 'Lag‘mon', price: 35000, category: 'main', available: true },
  { id: 'm3', name: 'Shashlik', price: 50000, category: 'main', available: true },
  { id: 'm4', name: 'Mastava', price: 22000, category: 'soup', available: true },
  { id: 'm5', name: 'Choy', price: 7000, category: 'drink', available: true },
  { id: 'm6', name: 'Ayran', price: 10000, category: 'drink', available: true },
  { id: 'm7', name: 'Salat', price: 18000, category: 'salad', available: true },
];

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, tableNote } = useSelector((state) => state.cart);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (item, quantity, note) => {
    const productId = item.productId || item.menuItemId || item.id;
    dispatch(addToCart({ ...item, productId, quantity: quantity || item.quantity || 1, note }));
  };

  const removeItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const updateQuantity = (id, quantity, note) => {
    dispatch(updateCartItemQuantity({ id, quantity, note }));
  };

  const clear = () => {
    dispatch(clearCart());
  };

  const setNote = (note) => {
    dispatch(setTableNote(note));
  };

  return {
    items,
    total,
    tableNote,
    menu: sampleMenu,
    loading: false,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    setNote,
  };
};