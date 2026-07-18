import React from 'react';
import CartItem from './CartItem';

const Cart = ({ items, onRemove, onUpdateQuantity }) => {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/80 p-6 text-center text-slate-400">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#021018] text-3xl">🛒</div>
        <p className="text-lg font-semibold text-white">Savat bo'sh</p>
        <p className="max-w-xs text-sm text-slate-500">Menyu elementlarini tanlab, ularni savatga qo'shing.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/80">
      <div className="border-b border-cyan-500/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Savat</h3>
          <span className="text-sm font-semibold text-white">{items.length} ta</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  );
};

export default Cart;
