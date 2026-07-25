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
          <div key={i} className="h-56 rounded-[1.75rem] bg-linear-to-br from-slate-100 to-slate-200 dark:from-[#07131d] dark:to-[#091723] shadow-sm dark:shadow-[0_18px_45px_rgba(7,18,30,0.6)]" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center shadow-sm dark:border-cyan-500/10 dark:bg-[#04111a]/70 dark:shadow-[0_20px_50px_rgba(7,18,30,0.5)]">
        <div className="text-4xl">📦</div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Menyu topilmadi</p>
        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-500">Qidiruv matnini o'zgartiring yoki bo'limni tanlang.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {filtered.map((item) => (
        <MenuItem key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
};

export default List;
