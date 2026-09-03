import CartItem from './CartItem';

const Cart = ({ items, onRemove, onUpdateQuantity }) => {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 dark:border-cyan-500/10 dark:bg-[#04111a]/80 dark:text-slate-400">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl dark:bg-[#021018]">🛒</div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Savat bo'sh</p>
        <p className="max-w-xs text-sm text-slate-400 dark:text-slate-500">Menyu elementlarini tanlab, ularni savatga qo'shing.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-cyan-500/10 dark:bg-[#04111a]/80">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-cyan-500/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Savat</h3>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{items.length} ta</span>
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
