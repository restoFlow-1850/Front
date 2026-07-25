import { useState } from 'react';

const MenuItem = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAdd({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      total: item.price * quantity,
      note: ''
    });
    setQuantity(1);
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-4xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 dark:border-cyan-500/10 dark:bg-[#07131d] dark:shadow-[0_20px_45px_rgba(7,18,30,0.6)] dark:hover:border-cyan-400/30">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-orange-600 dark:bg-cyan-500/10 dark:text-cyan-200">{item.category}</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.price.toLocaleString()} UZS</span>
        </div>
        {item.image && (
          <div className="mb-4 overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-cyan-500/10">
            <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{item.name}</h3>
          {item.nameRu && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.nameRu}</p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-cyan-500/10 dark:bg-[#04111a]">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-10 w-10 rounded-full bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-[#04131c] dark:text-slate-200 dark:hover:bg-[#0c2a38]"
          >
            −
          </button>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="h-10 w-10 rounded-full bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-[#04131c] dark:text-slate-200 dark:hover:bg-[#0c2a38]"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-3xl bg-linear-to-r from-orange-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-orange-500 hover:to-emerald-400 dark:from-cyan-500 dark:to-sky-500 dark:text-slate-950 dark:hover:from-cyan-400 dark:hover:to-sky-400"
        >
          Qo'shish
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
