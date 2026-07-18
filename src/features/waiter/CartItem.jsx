import React, { useState, useEffect } from 'react';

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
    <div className="rounded-[1.75rem] border border-cyan-500/10 bg-[#061923] p-4 shadow-[0_20px_60px_rgba(7,18,30,0.45)]">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#04111a] px-3 py-2 text-sm text-slate-200">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.note)}
                className="h-9 w-9 rounded-full bg-[#071a24] text-lg font-semibold text-white transition hover:bg-[#0f2d3f]"
              >
                −
              </button>
              <span className="min-w-[34px] text-center text-sm font-semibold text-white">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.note)}
                className="h-9 w-9 rounded-full bg-[#071a24] text-lg font-semibold text-white transition hover:bg-[#0f2d3f]"
              >
                +
              </button>
            </div>
            <input
              type="text"
              placeholder="Izoh..."
              className="flex-1 min-w-[110px] rounded-[1.25rem] border border-cyan-500/10 bg-[#021018] px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-semibold text-white">{(item.price * item.quantity).toLocaleString()} UZS</p>
          <button
            onClick={() => onRemove(item.id)}
            className="mt-3 text-sm font-medium text-rose-400 transition hover:text-rose-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;