import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CheckCircle,
  MapPin,
  Search,
  Building,
  Users,
  UtensilsCrossed,
  Loader2,
  X,
} from 'lucide-react'
import { Card, Button, Badge } from '../../../components/ui'
import { toast } from 'react-toastify'
import { getRestaurants, updateRestaurant } from '../api'
import { getTables } from '../../tables/api'
import { apiErrorMessage, unwrapList } from '../../../lib/api'
import { TABLE_STATUS } from '../../../constants/roles'

const DEFAULT_CENTER = [41.311081, 69.240562]

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])

export default function RestaurantMapCard() {
  const { t } = useTranslation()

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const placementMarkerRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const rafIdRef = useRef(null)
  const locatedCoordsRef = useRef([])
  const editingRef = useRef(null)

  const [restaurants, setRestaurants] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [draftCoords, setDraftCoords] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  editingRef.current = editingRestaurant

  const hasCoords = (r) => {
    const c = r?.coordinates
    return c != null && c.lat != null && c.lng != null
  }

  const restaurantId = (r) => r?.id ?? r?._id

  // Har bir filial bo'yicha stol statistikasi (GET /api/tables asosida hisoblanadi).
  const tableStats = useMemo(() => {
    const map = new Map()
    for (const table of tables) {
      const rid = table?.restaurant
      if (rid == null) continue
      const stats = map.get(rid) ?? { total: 0, occupied: 0 }
      stats.total += 1
      if (table.status === TABLE_STATUS.BUSY || table.status === TABLE_STATUS.RESERVED) {
        stats.occupied += 1
      }
      map.set(rid, stats)
    }
    return map
  }, [tables])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [restaurantsRes, tablesRes] = await Promise.all([
        getRestaurants({ limit: 200 }),
        getTables({ limit: 1000 }),
      ])
      const list = unwrapList(restaurantsRes, 'restaurants')
      setRestaurants(list)
      setTables(unwrapList(tablesRes, 'tables'))
      setSelectedId((prev) => {
        if (prev && list.some((r) => restaurantId(r) === prev)) return prev
        const firstLocated = list.find(hasCoords)
        return firstLocated ? restaurantId(firstLocated) : null
      })
    } catch (err) {
      setLoadError(apiErrorMessage(err, t('branchesMap.loadFailed')))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedBranch = useMemo(
    () => restaurants.find((r) => restaurantId(r) === selectedId) ?? null,
    [restaurants, selectedId],
  )

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return restaurants
    return restaurants.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.address ?? '').toLowerCase().includes(q) ||
        (r.city ?? '').toLowerCase().includes(q),
    )
  }, [restaurants, searchQuery])

  // ─── Xarita yaratish (bir marta) ──────────────────────────────────────
  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(el, {
      center: DEFAULT_CENTER,
      zoom: 11,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      noWrap: true,
    }).addTo(map)

    mapInstanceRef.current = map

    // Admin joylashuv belgilash uchun xaritaga bosganda koordinata olinadi.
    map.on('click', (e) => {
      if (!editingRef.current) return
      setDraftCoords({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      })
    })

    let centered = false
    const recalcSize = () => {
      map.invalidateSize()
      const { width, height } = el.getBoundingClientRect() ?? {}
      if (!centered && width > 0 && height > 0) {
        centered = true
        if (locatedCoordsRef.current.length > 0) {
          map.fitBounds(L.latLngBounds(locatedCoordsRef.current), { padding: [40, 40] })
        } else {
          map.setView(DEFAULT_CENTER, 11, { animate: false })
        }
      }
    }
    const rafId = requestAnimationFrame(recalcSize)
    const resizeObserver = new ResizeObserver(recalcSize)
    resizeObserver.observe(el)
    resizeObserverRef.current = resizeObserver
    rafIdRef.current = rafId

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // ─── Filial markerlari ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    const located = restaurants.filter(hasCoords)
    locatedCoordsRef.current = located.map((r) => [r.coordinates.lat, r.coordinates.lng])

    located.forEach((r) => {
      const stats = tableStats.get(restaurantId(r)) ?? { total: 0, occupied: 0 }
      const isPeak = stats.total > 0 && stats.occupied >= stats.total

      const pinColorClass = isPeak
        ? 'from-rose-500 to-red-600 shadow-rose-500/40'
        : 'from-orange-500 to-amber-600 shadow-orange-500/40'

      const icon = L.divIcon({
        className: 'custom-restaurant-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full ${isPeak ? 'bg-rose-400' : 'bg-orange-400'} opacity-60"></span>
            <div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr ${pinColorClass} text-white shadow-lg transition-transform duration-200 hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6-5.333-6-10a6 6 0 0112 0c0 4.667-6 10-6 10z"/>
                <circle cx="12" cy="11" r="2" fill="currentColor"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      const statusText = isPeak ? t('branchesMap.peak') : t('branchesMap.open')
      const tablesLine =
        stats.total > 0
          ? `<div style="font-size:11px; color:#334155; font-weight:600; background:#F1F5F9; padding:4px 6px; border-radius:6px; margin-top:4px;">
              ${t('branchesMap.tablesLabel')}: ${t('branchesMap.tablesOccupied', {
                occupied: stats.occupied,
                total: stats.total,
              })}
            </div>`
          : ''
      const phoneLine = r.phone
        ? `<div style="font-size:11px; color:#2563EB; margin-top:4px; font-weight:600;">📞 ${escapeHtml(r.phone)}</div>`
        : ''
      const ratingLine =
        r.rating != null
          ? `<span style="font-weight:600; color:#475569;">⭐ ${Number(r.rating).toFixed(1)}</span>`
          : ''

      const popupContent = `
        <div style="font-family: inherit; width: 210px; padding: 2px;">
          <div style="font-weight: 800; font-size: 14px; color: #0F172A; margin-bottom: 2px;">${escapeHtml(r.name)}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">${escapeHtml(r.address || r.city || '')}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="font-weight: 700; color: ${isPeak ? '#EF4444' : '#10B981'};">${isPeak ? '🔥' : '🟢'} ${statusText}</span>
            ${ratingLine}
          </div>
          ${tablesLine}
          ${phoneLine}
        </div>
      `

      const marker = L.marker([r.coordinates.lat, r.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(popupContent)

      marker.on('click', () => setSelectedId(restaurantId(r)))

      markersRef.current[restaurantId(r)] = marker
    })

    map.invalidateSize()
  }, [restaurants, tableStats, t])

  // ─── Tanlangan filialga uchish ────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedBranch || !hasCoords(selectedBranch)) return
    map.flyTo([selectedBranch.coordinates.lat, selectedBranch.coordinates.lng], 14, {
      duration: 0.9,
    })
  }, [selectedBranch])

  // ─── Joylashuv belgilash markeri ──────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (placementMarkerRef.current) {
      placementMarkerRef.current.remove()
      placementMarkerRef.current = null
    }

    if (editingRestaurant && draftCoords) {
      const icon = L.divIcon({
        className: 'custom-placement-pin',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6-5.333-6-10a6 6 0 0112 0c0 4.667-6 10-6 10z"/>
                <circle cx="12" cy="11" r="2" fill="currentColor"/>
              </svg>
            </div>
            <span class="mt-1 rounded-md bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md">
              ${draftCoords.lat.toFixed(5)}, ${draftCoords.lng.toFixed(5)}
            </span>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })
      placementMarkerRef.current = L.marker([draftCoords.lat, draftCoords.lng], { icon }).addTo(map)
    }
  }, [editingRestaurant, draftCoords])

  // ─── Amallar ──────────────────────────────────────────────────────────
  const handleSelectBranch = (r) => {
    setSelectedId(restaurantId(r))
    if (hasCoords(r)) {
      const marker = markersRef.current[restaurantId(r)]
      setTimeout(() => marker?.openPopup(), 350)
    }
  }

  const startEditLocation = (r) => {
    setSelectedId(restaurantId(r))
    setEditingRestaurant(r)
    setDraftCoords(hasCoords(r) ? { lat: r.coordinates.lat, lng: r.coordinates.lng } : null)
    if (hasCoords(r) && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([r.coordinates.lat, r.coordinates.lng], 15, { duration: 0.9 })
    }
  }

  const cancelEditLocation = () => {
    setEditingRestaurant(null)
    setDraftCoords(null)
  }

  const handleSaveLocation = async () => {
    if (!editingRestaurant || !draftCoords) return
    setIsSaving(true)
    try {
      await updateRestaurant(restaurantId(editingRestaurant), { coordinates: draftCoords })
      toast.success(t('branchesMap.locationSaved'))
      setEditingRestaurant(null)
      setDraftCoords(null)
      await loadData()
    } catch (err) {
      toast.error(apiErrorMessage(err, t('branchesMap.locationSaveFailed')))
    } finally {
      setIsSaving(false)
    }
  }

  const locatedCount = restaurants.filter(hasCoords).length
  const statsFor = (r) => tableStats.get(restaurantId(r)) ?? { total: 0, occupied: 0 }

  return (
    <Card className="mb-6 border-slate-200 shadow-sm dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('branchesMap.cardTitle')}
              </h3>
              <Badge variant="neutral">
                {t('branchesMap.branchCount', { count: restaurants.length })}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('branchesMap.cardSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Map Display */}
      <div className="mt-4 relative flex-1 min-h-[420px]">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full rounded-xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
        />

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              {t('loading')}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <p className="text-xs font-semibold text-rose-500">{loadError}</p>
              <Button variant="secondary" className="text-xs" onClick={loadData}>
                {t('branchesMap.retry')}
              </Button>
            </div>
          </div>
        )}

        {/* Hech bir filialda joylashuv belgilanmagan */}
        {!loading && !loadError && restaurants.length > 0 && locatedCount === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/70 px-6 backdrop-blur-sm dark:bg-slate-900/70">
            <p className="max-w-sm text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('branchesMap.allNeedLocation')}
            </p>
          </div>
        )}

        {/* Selected Branch Floating Badge */}
        {!loading && selectedBranch && hasCoords(selectedBranch) && !editingRestaurant && (
          <div className="absolute top-3 left-3 z-20 max-w-[270px] rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {selectedBranch.name}
              </span>
              {selectedBranch.rating != null && (
                <span className="text-[10px] font-bold text-orange-500">
                  ⭐ {Number(selectedBranch.rating).toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {selectedBranch.address || selectedBranch.city}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {statsFor(selectedBranch).total > 0
                  ? t('branchesMap.tablesOccupied', {
                      occupied: statsFor(selectedBranch).occupied,
                      total: statsFor(selectedBranch).total,
                    })
                  : '—'}
              </span>
              <span
                className={`font-bold ${
                  statsFor(selectedBranch).total > 0 &&
                  statsFor(selectedBranch).occupied >= statsFor(selectedBranch).total
                    ? 'text-rose-500'
                    : 'text-emerald-500'
                }`}
              >
                {statsFor(selectedBranch).total > 0 &&
                statsFor(selectedBranch).occupied >= statsFor(selectedBranch).total
                  ? t('branchesMap.peak')
                  : t('branchesMap.active')}
              </span>
            </div>
          </div>
        )}

        {/* Joylashuv belgilash paneli */}
        {editingRestaurant && (
          <div className="absolute top-3 left-1/2 z-20 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-xl border border-blue-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-blue-900/60 dark:bg-slate-900/95">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {editingRestaurant.name}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {t('branchesMap.clickOnMapToChoose')}
                </p>
                {draftCoords && (
                  <p className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {t('branchesMap.selectedPoint')}: {draftCoords.lat.toFixed(5)},{' '}
                    {draftCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={cancelEditLocation}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={t('cancel')}
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={cancelEditLocation}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                className="px-3 py-1.5 text-xs"
                disabled={!draftCoords || isSaving}
                isLoading={isSaving}
                onClick={handleSaveLocation}
              >
                {t('branchesMap.saveLocation')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Search & Branch List */}
      <div className="mt-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('branchesMap.searchPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
          />
        </div>

        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 scrollbar-thin">
          {!loading && filteredRestaurants.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              {searchQuery ? t('branchesMap.noBranches') : t('branchesMap.noBranchesYet')}
            </div>
          ) : (
            filteredRestaurants.map((branch) => {
              const isSelected = selectedId != null && selectedId === restaurantId(branch)
              const stats = statsFor(branch)
              const isBusy = stats.total > 0 && stats.occupied >= stats.total

              return (
                <div
                  key={restaurantId(branch)}
                  onClick={() => handleSelectBranch(branch)}
                  className={`flex items-center justify-between gap-2 p-2.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className={isSelected ? 'text-orange-500' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {branch.name}
                      </span>
                      <span
                        className={`shrink-0 inline-block text-[10px] font-bold ${
                          isBusy ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                      >
                        {isBusy ? t('branchesMap.busy') : t('branchesMap.open')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {branch.address || branch.city || '—'}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {hasCoords(branch) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle size={11} />
                          {t('branchesMap.locationSet')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <MapPin size={11} />
                          {t('branchesMap.locationNotSet')}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-1.5 py-0.5 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditLocation(branch)
                        }}
                      >
                        <MapPin size={11} className="mr-0.5 text-orange-500" />
                        {hasCoords(branch)
                          ? t('branchesMap.editLocation')
                          : t('branchesMap.setLocation')}
                      </Button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <Users size={12} className="text-slate-400" />
                      {stats.total > 0
                        ? t('branchesMap.tablesOccupied', {
                            occupied: stats.occupied,
                            total: stats.total,
                          })
                        : '—'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Card>
  )
}