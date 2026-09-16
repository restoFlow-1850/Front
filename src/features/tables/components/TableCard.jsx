import React, { useState, useRef, useEffect } from 'react'
import { Crown, MapPin, MoreVertical, Pencil, Trash2, Users, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TABLE_STATUS, TABLE_STATUS_LABELS } from '../../../constants/roles'
import TableIllustration from './TableIllustration'

export default function TableCard({
  table,
  canManage = false,
  canCreateOrder = false,
  onEdit,
  onDelete,
  onStatusChange,
  onOrder,
}) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const formattedNumber = String(table.number || 0).padStart(2, '0')
  const status = table.status || TABLE_STATUS.FREE

  // Badge styles per status
  const badgeStyles = {
    [TABLE_STATUS.FREE]: {
      bg: 'bg-[#E8F5E9] dark:bg-emerald-950/60',
      text: 'text-[#2E7D32] dark:text-emerald-300',
      dot: 'bg-[#2E7D32] dark:bg-emerald-400',
      label: t('tableStatus.available'),
    },
    [TABLE_STATUS.BUSY]: {
      bg: 'bg-[#FFEBEE] dark:bg-rose-950/60',
      text: 'text-[#C62828] dark:text-rose-300',
      dot: 'bg-[#C62828] dark:bg-rose-400',
      label: t('tableStatus.occupied'),
    },
    [TABLE_STATUS.RESERVED]: {
      bg: 'bg-[#FFF8E1] dark:bg-amber-950/60',
      text: 'text-[#F57F17] dark:text-amber-300',
      dot: 'bg-[#F57F17] dark:bg-amber-400',
      label: t('tableStatus.reserved'),
    },
  }[status] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500',
    label: t(`tableStatus.${status}`, TABLE_STATUS_LABELS[status] ?? status),
  }

  const isVip = Boolean(table.location && /vip/i.test(table.location))

  const handleCardClick = (e) => {
    // Prevent triggering if clicked on menu or options button
    if (menuRef.current && menuRef.current.contains(e.target)) return
    if (onOrder) {
      onOrder(table)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:bg-slate-900/80 ${
        isVip
          ? 'border border-amber-300/60 bg-gradient-to-br from-[#FFFDF9] to-[#FAF4E8] dark:border-amber-500/30 dark:from-slate-900 dark:to-slate-800'
          : 'border border-[#ECE8DF] bg-[#FAF8F5] dark:border-slate-800'
      } ${
        onOrder ? 'cursor-pointer hover:border-[#F97316]/50' : ''
      }`}
    >
      {/* Background Leaf/Pattern Watermark */}
      <svg
        className={`pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 ${
          isVip ? 'text-amber-500/10' : 'text-[#E2DDD3]/40 dark:text-slate-800/40'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        viewBox="0 0 100 100"
      >
        <path d="M 50 100 C 50 50, 90 20, 100 0 C 70 20, 30 40, 50 100 Z" fill="currentColor" opacity="0.15" />
        <path d="M 50 100 Q 70 60 95 20" stroke="currentColor" strokeDasharray="2 2" />
        <path d="M 50 100 C 30 70, 0 80, -10 100 Z" fill="currentColor" opacity="0.1" />
      </svg>

      {/* Card Header: Table Number, Status Badge, Menu */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {formattedNumber}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles.bg} ${badgeStyles.text}`}
          >
            <span className={`h-2 w-2 rounded-full ${badgeStyles.dot}`} />
            {badgeStyles.label}
          </span>
        </div>

        {/* Action Menu (Three vertical dots) */}
        <div ref={menuRef} className="relative z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((prev) => !prev)
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Stol menyusi"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {canCreateOrder && onOrder && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onOrder(table)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F97316] hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t('waiter.submitOrder')}
                </button>
              )}

              {canManage && onStatusChange && (
                <div className="border-t border-slate-100 py-1 dark:border-slate-700/60">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {t('orders.changeStatus')}
                  </div>
                  {Object.values(TABLE_STATUS).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onStatusChange(table._id, st)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium ${
                        table.status === st
                          ? 'bg-slate-100 font-bold text-slate-900 dark:bg-slate-700 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          st === TABLE_STATUS.FREE
                            ? 'bg-emerald-500'
                            : st === TABLE_STATUS.BUSY
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {t(`tableStatus.${st}`, TABLE_STATUS_LABELS[st] || st)}
                    </button>
                  ))}
                </div>
              )}

              {canManage && (
                <div className="border-t border-slate-100 pt-1 dark:border-slate-700/60">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onEdit(table)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('edit')}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onDelete(table)
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-details: Capacity & Location */}
      <div className="relative z-10 mt-1.5 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Users className="h-3.5 w-3.5" />
          <span>{table.capacity} {t('tables.capacity')}</span>
        </div>

        {table.location && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {isVip ? (
              <>
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">{table.location}</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{table.location}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Table Visual Illustration */}
      <div className="relative z-10 mt-2 flex justify-center">
        <TableIllustration capacity={table.capacity} isVip={isVip} className="h-36 w-full max-w-[260px]" />
      </div>
    </div>
  )
}