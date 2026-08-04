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
    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#05111d]/95 dark:shadow-[0_40px_90px_rgba(15,23,42,0.6)] sm:p-6 dark:backdrop-blur-xl">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-cyan-500/10 dark:bg-[#04111a]/70 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-600 dark:text-cyan-300">Holat</p>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">{table ? `#${table.number} · ${table.zone}` : 'Stol tanlanmagan'}</p>
          </div>
          <button
            onClick={onTransfer}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-600 dark:border-cyan-500/20 dark:bg-[#021018] dark:text-cyan-200 dark:hover:border-cyan-400 dark:hover:bg-[#061724]"
          >
            O'tkazish
          </button>
        </div>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">Buyurtmani nazorat qilish, jadvalni o'zgartirish va mijoz holatini real vaqtda aks ettirish.</p>
      </div>

      <div className="mt-5">
        <Cart
          items={items}
          onRemove={onRemoveItem}
          onUpdateQuantity={onUpdateQuantity}
        />
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-cyan-500/10 dark:bg-[#04121b]/70">
        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mijoz izohi</label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-cyan-500/10 dark:bg-[#021018] dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
          placeholder="Maxsus izoh qoldiring"
        />
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-cyan-500/10 dark:bg-[#03111d]/90">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Jami</span>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">{total.toLocaleString()} UZS</span>
        </div>
        <button
          onClick={onSubmitOrder}
          disabled={isSubmitting || items.length === 0 || !table}
          className="mt-5 w-full rounded-3xl bg-linear-to-r from-orange-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:from-orange-500 hover:to-emerald-400 dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950 dark:hover:from-cyan-400 dark:hover:to-sky-400"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
        </button>
      </div>

      <button
        onClick={onClearCart}
        className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:border-cyan-500/10 dark:bg-[#041018] dark:text-slate-300 dark:hover:bg-[#071729]"
      >
        Savatni bo'shatish
      </button>
    </div>
  );
};

export default CartPanel;
