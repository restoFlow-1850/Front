import React from 'react';
import MenuItem from './MenuItem';
import { useCart } from '../../hooks/useCart';

const List = ({ searchQuery, category, onAdd }) => {
  const { menu, loading } = useCart();

  const filtered = menu.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameRu?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = category === 'all' || item.category === category;
    return matchSearch && matchCategory && item.available;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-56 rounded-[1.75rem] bg-gradient-to-br from-[#07131d] to-[#091723] shadow-[0_18px_45px_rgba(7,18,30,0.6)]" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/70 p-6 text-center shadow-[0_20px_50px_rgba(7,18,30,0.5)]">
        <div className="text-4xl">📦</div>
        <p className="text-lg font-semibold text-white">Menyu topilmadi</p>
        <p className="max-w-xs text-sm text-slate-500">Qidiruv matnini o'zgartiring yoki bo'limni tanlang.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {filtered.map((item) => (
        <MenuItem key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
};

export default List;
