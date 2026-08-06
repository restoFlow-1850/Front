// Sahifalar bo'ylab bir xil ko'rinadigan kartochka konteyneri.
export default function Card({ children, className = '', padded = true, ...props }) {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${padded ? 'p-5' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

/** Raqamli ko'rsatkich kartochkasi (dashboard uchun). */
export function StatCard({ icon: Icon, label, value, hint, tone = 'indigo' }) {
    const tones = {
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    }

    return (
        <Card className="flex items-center gap-4">
            {Icon && (
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            )}
            <div className="min-w-0">
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
            </div>
        </Card>
    )
}
