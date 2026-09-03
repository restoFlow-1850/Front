import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (e) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-4 py-4">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}