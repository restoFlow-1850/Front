import { useState, useEffect } from 'react';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [note, setNote] = useState(item.note || '');

  useEffect(() => {
    setNote(item.note || '');
  }, [item.id, item.note]);

  const handleNoteChange = (value) => {
    setNote(value);
    onUpdateQuantity(item.id, item.quantity, value);
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/10 dark:bg-[#061923] dark:shadow-[0_20px_60px_rgba(7,18,30,0.45)]">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate dark:text-white">{item.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-[#04111a] dark:text-slate-200">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.note)}
                className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-[#071a24] dark:text-white dark:hover:bg-[#0f2d3f]"
              >
                −
              </button>
              <span className="min-w-8.5 text-center text-sm font-semibold text-slate-900 dark:text-white">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.note)}
                className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-[#071a24] dark:text-white dark:hover:bg-[#0f2d3f]"
              >
                +
              </button>
            </div>
            <input
              type="text"
              placeholder="Izoh..."
              className="flex-1 min-w-27.5 rounded-[1.25rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-cyan-500/10 dark:bg-[#021018] dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} UZS</p>
          <button
            onClick={() => onRemove(item.id)}
            className="mt-3 text-sm font-medium text-rose-500 transition hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
