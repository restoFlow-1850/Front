import React, { useState } from 'react';

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
    <div className="flex h-full flex-col justify-between rounded-[2rem] border border-cyan-500/10 bg-[#07131d] p-5 shadow-[0_20px_45px_rgba(7,18,30,0.6)] transition hover:-translate-y-1 hover:border-cyan-400/30">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">{item.category}</span>
          <span className="text-sm font-semibold text-slate-400">{item.price.toLocaleString()} UZS</span>
        </div>
        {item.image && (
          <div className="mb-4 overflow-hidden rounded-[1.75rem] border border-cyan-500/10">
            <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">{item.name}</h3>
          {item.nameRu && (
            <p className="mt-2 text-sm text-slate-400">{item.nameRu}</p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-cyan-500/10 bg-[#04111a] p-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-10 w-10 rounded-full bg-[#04131c] text-lg font-semibold text-slate-200 transition hover:bg-[#0c2a38]"
          >
            −
          </button>
          <span className="text-lg font-semibold text-white">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="h-10 w-10 rounded-full bg-[#04131c] text-lg font-semibold text-slate-200 transition hover:bg-[#0c2a38]"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-[1.5rem] bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-sky-400"
        >
          Qo'shish
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
