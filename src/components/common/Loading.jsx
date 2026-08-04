const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
}

export default function Loading({ size = 'md', fullPage = false, label }) {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className={`animate-spin rounded-full border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 ${sizes[size]}`}
            />
            {label && <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>}
        </div>
    )

    if (fullPage) {
        return (
            <div className="flex min-h-[50vh] w-full items-center justify-center">
                {spinner}
            </div>
        )
    }

    return spinner
}
