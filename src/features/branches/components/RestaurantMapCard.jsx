import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { loadYandexMaps, YANDEX_KEY } from '../yandexMaps'
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
  const ymapsRef = useRef(null)
  const fittedRef = useRef(false)
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
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)

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

  // ─── Xarita yaratish (bir marta) — Yandex Maps ────────────────────────
  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return undefined
    let cancelled = false

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !mapContainerRef.current) return
        ymapsRef.current = ymaps
        const map = new ymaps.Map(
          el,
          { center: DEFAULT_CENTER, zoom: 11, controls: ['zoomControl', 'geolocationControl', 'searchControl'] },
          { suppressMapOpenBlock: true },
        )
        mapInstanceRef.current = map

        // Admin joylashuv belgilash uchun xaritaga bosganda koordinata olinadi.
        map.events.add('click', (e) => {
          if (!editingRef.current) return
          const [lat, lng] = e.get('coords')
          setDraftCoords({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) })
        })

        const resizeObserver = new ResizeObserver(() => map.container.fitToViewport())
        resizeObserver.observe(el)
        resizeObserverRef.current = resizeObserver
        setMapReady(true)
      })
      .catch(() => {
        if (!cancelled) setMapError(true)
      })

    return () => {
      cancelled = true
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
      markersRef.current = {}
      placementMarkerRef.current = null
      setMapReady(false)
    }
  }, [])

  // ─── Filial markerlari ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const ymaps = ymapsRef.current
    if (!map || !ymaps) return

    Object.values(markersRef.current).forEach((m) => map.geoObjects.remove(m))
    markersRef.current = {}

    const located = restaurants.filter(hasCoords)
    locatedCoordsRef.current = located.map((r) => [r.coordinates.lat, r.coordinates.lng])

    located.forEach((r) => {
      const stats = tableStats.get(restaurantId(r)) ?? { total: 0, occupied: 0 }
      const isPeak = stats.total > 0 && stats.occupied >= stats.total

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

      const balloonContent = `
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

      const marker = new ymaps.Placemark(
        [r.coordinates.lat, r.coordinates.lng],
        { balloonContent, hintContent: escapeHtml(r.name) },
        { preset: isPeak ? 'islands#redFoodIcon' : 'islands#orangeFoodIcon' },
      )
      marker.events.add('click', () => setSelectedId(restaurantId(r)))
      map.geoObjects.add(marker)
      markersRef.current[restaurantId(r)] = marker
    })

    // Birinchi yuklanishda barcha filiallarni ko'rsatamiz.
    if (!fittedRef.current && locatedCoordsRef.current.length > 0) {
      fittedRef.current = true
      if (locatedCoordsRef.current.length === 1) {
        map.setCenter(locatedCoordsRef.current[0], 13)
      } else {
        map.setBounds(ymaps.util.bounds.fromPoints(locatedCoordsRef.current), {
          checkZoomRange: true,
          zoomMargin: 40,
        })
      }
    }
  }, [restaurants, tableStats, t, mapReady])

  // ─── Tanlangan filialga uchish ────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedBranch || !hasCoords(selectedBranch)) return
    map.setCenter([selectedBranch.coordinates.lat, selectedBranch.coordinates.lng], 14, {
      duration: 600,
    })
  }, [selectedBranch, mapReady])

  // ─── Joylashuv belgilash markeri ──────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    const ymaps = ymapsRef.current
    if (!map || !ymaps) return

    if (placementMarkerRef.current) {
      map.geoObjects.remove(placementMarkerRef.current)
      placementMarkerRef.current = null
    }

    if (editingRestaurant && draftCoords) {
      const marker = new ymaps.Placemark(
        [draftCoords.lat, draftCoords.lng],
        { iconCaption: `${draftCoords.lat.toFixed(5)}, ${draftCoords.lng.toFixed(5)}` },
        { preset: 'islands#blueDotIconWithCaption' },
      )
      map.geoObjects.add(marker)
      placementMarkerRef.current = marker
    }
  }, [editingRestaurant, draftCoords, mapReady])

  // ─── Amallar ──────────────────────────────────────────────────────────
  const handleSelectBranch = (r) => {
    setSelectedId(restaurantId(r))
    if (hasCoords(r)) {
      const marker = markersRef.current[restaurantId(r)]
      setTimeout(() => marker?.balloon.open(), 700)
    }
  }

  const startEditLocation = (r) => {
    setSelectedId(restaurantId(r))
    setEditingRestaurant(r)
    setDraftCoords(hasCoords(r) ? { lat: r.coordinates.lat, lng: r.coordinates.lng } : null)
    if (hasCoords(r) && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([r.coordinates.lat, r.coordinates.lng], 15, { duration: 600 })
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

        {/* Yandex Maps kaliti yo'q yoki yuklanmadi */}
        {(mapError || !YANDEX_KEY) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-900/90">
            <p className="px-6 text-center text-xs font-semibold text-amber-600">
              {t('branchesMap.yandexUnavailable')}
            </p>
          </div>
        )}

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