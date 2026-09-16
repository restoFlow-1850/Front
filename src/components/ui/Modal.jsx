import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  headerActions,
  className = '',
  bodyClassName = '',
  containerClassName = '',
}) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasCustomMaxW = className.includes('max-w-')
  const hasCustomMaxH = className.includes('max-h-')
  const hasCustomW = className.includes('w-')
  const sizingDefaults = `${hasCustomMaxW ? '' : 'max-w-lg'} ${hasCustomMaxH ? '' : 'max-h-[85vh]'} ${hasCustomW ? '' : 'w-full'}`

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-3 md:p-4 backdrop-blur-sm ${containerClassName}`}
      onClick={onClose}
    >
      <div
        className={`flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-gray-800 ${sizingDefaults} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#111827] dark:text-white">{title}</h2>
          <div className="flex items-center gap-1.5">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Yopish"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className={`flex-1 ${bodyClassName || 'overflow-y-auto p-5'}`}>{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}