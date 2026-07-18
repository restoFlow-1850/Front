import React from 'react';
import Cart from './Cart';

const CartPanel = ({
  table,
  items,
  total,
  note,
  onNoteChange,
  onClearCart,
  onRemoveItem,
  onUpdateQuantity,
  onTransfer,
  onSubmitOrder,
  isSubmitting,
}) => {
  return (
    <div className="rounded-[2rem] border border-cyan-500/10 bg-[#05111d]/95 p-6 shadow-[0_40px_90px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Holat</p>
            <p className="mt-2 text-2xl font-semibold text-white">{table ? `#${table.number} · ${table.zone}` : 'Stol tanlanmagan'}</p>
          </div>
          <button
            onClick={onTransfer}
            className="rounded-full border border-cyan-500/20 bg-[#021018] px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400 hover:bg-[#061724]"
          >
            O'tkazish
          </button>
        </div>
        <p className="text-sm leading-6 text-slate-400">Buyurtmani nazorat qilish, jadvalni o'zgartirish va mijoz holatini real vaqtda aks ettirish.</p>
      </div>

      <div className="mt-5">
        <Cart
          items={items}
          onRemove={onRemoveItem}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-cyan-500/10 bg-[#04121b]/70 p-4">
        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Mijoz izohi</label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          className="mt-3 w-full rounded-[1.5rem] border border-cyan-500/10 bg-[#021018] px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          placeholder="Maxsus izoh qoldiring"
        />
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-cyan-500/10 bg-[#03111d]/90 p-5">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Jami</span>
          <span className="text-xl font-semibold text-white">{total.toLocaleString()} UZS</span>
        </div>
        <button
          onClick={onSubmitOrder}
          disabled={isSubmitting || items.length === 0 || !table}
          className="mt-5 w-full rounded-[1.5rem] bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50 hover:from-cyan-400 hover:to-sky-400"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </div>

      <button
        onClick={onClearCart}
        className="mt-4 w-full rounded-[1.5rem] border border-cyan-500/10 bg-[#041018] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-[#071729]"
      >
        Savatni bo'shatish
      </button>
    </div>
  );
};

export default CartPanel;
