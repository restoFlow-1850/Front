// Butun ekranni egallovchi yuklanish holati — sessiya tiklanayotganda va
// lazy sahifalar yuklanayotganda ishlatiladi.
export default function FullPageLoader({ label = 'Yuklanmoqda...' }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-500" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
