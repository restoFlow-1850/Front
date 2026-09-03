// Sahifalar bo'yilab bir xil ko'rinadigan kartochka konteyneri.
// Premium Orange brend dizayn sistemasi.
export default function Card({ children, className = '', padded = true, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-gray-800 dark:bg-[#1F2937] ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/** Raqamli ko'rsatkich kartochkasi (dashboard uchun). */
export function StatCard({ icon: Icon, label, value, hint, tone = 'orange' }) {
  const tones = {
    orange: 'bg-orange-50 text-[#F97316] border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  }

  return (
    <Card className="flex items-center gap-4 transition-all hover:border-orange-500/30">
      {Icon && (
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-sm ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[#6B7280] dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-[#111827] dark:text-white">{value}</p>
        {hint && <p className="truncate text-xs font-medium text-gray-400">{hint}</p>}
      </div>
    </Card>
  )
}
