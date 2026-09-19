import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  UtensilsCrossed,
  Phone,
  Navigation,
  CheckCircle,
  Plus,
  Search,
  Building,
  Users
} from 'lucide-react'
import { Card, Button, Badge, Modal, Input } from '../../../components/ui'
import { toast } from 'react-toastify'

// Restoran filiallari ro'yxati (Boshlang'ich restoranlar)
const INITIAL_RESTAURANTS = [
  {
    id: 1,
    name: 'RestoFlow Grand Central',
    address: 'Amir Temur shoh ko\'chasi, 108-uy, Toshkent',
    city: 'Toshkent',
    lat: 41.311081,
    lng: 69.240562,
    phone: '+998 (71) 200-11-22',
    status: 'open', // 'open' | 'busy' | 'closed'
    occupiedTables: 14,
    totalTables: 18,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'RestoFlow Chorsu Tradition',
    address: 'Alisher Navoiy ko\'chasi, 45-uy, Toshkent',
    city: 'Toshkent',
    lat: 41.3235,
    lng: 69.2360,
    phone: '+998 (71) 200-33-44',
    status: 'open',
    occupiedTables: 9,
    totalTables: 12,
    rating: 4.8,
  },
  {
    id: 3,
    name: 'RestoFlow Chilanzar Express',
    address: 'Chilonzor 9-mavze, Qatortol ko\'chasi, Toshkent',
    city: 'Toshkent',
    lat: 41.2780,
    lng: 69.2050,
    phone: '+998 (71) 200-55-66',
    status: 'open',
    occupiedTables: 6,
    totalTables: 10,
    rating: 4.7,
  },
  {
    id: 4,
    name: 'RestoFlow Yunusabad Peak',
    address: 'Yunusobod 14-mavze, Amir Temur ko\'chasi, Toshkent',
    city: 'Toshkent',
    lat: 41.3650,
    lng: 69.2880,
    phone: '+998 (71) 200-77-88',
    status: 'busy',
    occupiedTables: 15,
    totalTables: 15,
    rating: 4.95,
  },
  {
    id: 5,
    name: 'RestoFlow Samarkand Oasis',
    address: 'Registon ko\'chasi, 12-uy, Samarqand',
    city: 'Samarqand',
    lat: 39.6542,
    lng: 66.9597,
    phone: '+998 (66) 200-99-00',
    status: 'open',
    occupiedTables: 7,
    totalTables: 14,
    rating: 4.85,
  },
]

export default function RestaurantMapCard() {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const resizeObserverRef = useRef(null)
  const rafIdRef = useRef(null)

  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS)
  const [selectedBranch, setSelectedBranch] = useState(INITIAL_RESTAURANTS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Yangi filial formasi
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    city: 'Toshkent',
    phone: '',
    lat: 41.31,
    lng: 69.25,
    totalTables: 10,
  })

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Map Initialization & Updates
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Create Leaflet Map centered on Tashkent
    const map = L.map(mapContainerRef.current, {
      center: [selectedBranch?.lat || 41.311081, selectedBranch?.lng || 69.240562],
      zoom: 11,
      zoomControl: true,
    })

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      // Stops the world map from repeating side-by-side across the container
      noWrap: true,
    }).addTo(map)

    mapInstanceRef.current = map

    // The map lives inside a modal, so Leaflet initialises while the container is
    // still 0×0 — that's why it rendered a random zoomed-out patch of ocean instead
    // of Tashkent. Re-measure and re-center as soon as the box actually has size.
    const target = [selectedBranch?.lat || 41.311081, selectedBranch?.lng || 69.240562]
    let centered = false
    const recalcSize = () => {
      map.invalidateSize()
      const { width, height } = mapContainerRef.current?.getBoundingClientRect() ?? {}
      if (!centered && width > 0 && height > 0) {
        centered = true
        map.setView(target, 13, { animate: false })
      }
    }
    const rafId = requestAnimationFrame(recalcSize)
    const resizeObserver = new ResizeObserver(recalcSize)
    resizeObserver.observe(mapContainerRef.current)
    resizeObserverRef.current = resizeObserver
    rafIdRef.current = rafId
    markersRef.current = {}

    // Add markers for all restaurants
    restaurants.forEach((r) => {
      const isPeak = r.status === 'busy' || r.occupiedTables >= r.totalTables
      const pinColorClass = isPeak
        ? 'from-rose-500 to-red-600 shadow-rose-500/40'
        : 'from-orange-500 to-amber-600 shadow-orange-500/40'

      const customDivIcon = L.divIcon({
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

      const popupContent = `
        <div style="font-family: inherit; width: 200px; padding: 2px;">
          <div style="font-weight: 800; font-size: 14px; color: #0F172A; margin-bottom: 2px;">${r.name}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">${r.address}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span style="font-weight: 700; color: ${isPeak ? '#EF4444' : '#10B981'};">
              ${isPeak ? '🔥 Peak (Band 100%)' : '🟢 Ochiq'}
            </span>
            <span style="font-weight: 600; color: #475569;">⭐ ${r.rating}</span>
          </div>
          <div style="font-size: 11px; color: #334155; font-weight: 600; background: #F1F5F9; padding: 4px 6px; border-radius: 6px;">
            Stollar: ${r.occupiedTables} / ${r.totalTables} band
          </div>
          <div style="font-size: 11px; color: #2563EB; margin-top: 4px; font-weight: 600;">
            📞 ${r.phone}
          </div>
        </div>
      `

      const marker = L.marker([r.lat, r.lng], { icon: customDivIcon })
        .addTo(map)
        .bindPopup(popupContent)

      marker.on('click', () => {
        setSelectedBranch(r)
      })

      markersRef.current[r.id] = marker
    })

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
  }, [restaurants])

  // Select branch and fly to coordinates
  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch)
    if (mapInstanceRef.current && branch) {
      mapInstanceRef.current.flyTo([branch.lat, branch.lng], 14, {
        duration: 1.2,
      })
      const marker = markersRef.current[branch.id]
      if (marker) {
        marker.openPopup()
      }
    }
  }

  // Add new branch
  const handleAddBranchSubmit = (e) => {
    e.preventDefault()
    if (!newBranch.name || !newBranch.address) {
      toast.error('Iltimos, filial nomi va manzilini kiriting!')
      return
    }

    const created = {
      id: Date.now(),
      name: newBranch.name,
      address: newBranch.address,
      city: newBranch.city,
      lat: Number(newBranch.lat) || 41.31,
      lng: Number(newBranch.lng) || 69.25,
      phone: newBranch.phone || '+998 (71) 200-00-00',
      status: 'open',
      occupiedTables: 0,
      totalTables: Number(newBranch.totalTables) || 10,
      rating: 5.0,
    }

    setRestaurants((prev) => [created, ...prev])
    setIsAddModalOpen(false)
    setNewBranch({
      name: '',
      address: '',
      city: 'Toshkent',
      phone: '',
      lat: 41.31,
      lng: 69.25,
      totalTables: 10,
    })
    toast.success('Yangi restoran filiali xaritaga qo\'shildi! 📍')
  }

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
                Restoran Filiallari Xaritasi
              </h3>
              <Badge variant="neutral">{restaurants.length} ta Filial</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Barcha filiallar va stollar to'liqlik darajasi
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs"
        >
          <Plus size={14} className="mr-1 text-orange-500" />
          Filial Qo'shish
        </Button>
      </div>

      {/* Map Display */}
      <div className="mt-4 relative flex-1 min-h-[420px]">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full rounded-xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
        />

        {/* Selected Branch Floating Badge overlay */}
        {selectedBranch && (
          <div className="absolute top-3 left-3 z-20 max-w-[260px] rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {selectedBranch.name}
              </span>
              <span className="text-[10px] font-bold text-orange-500">
                ⭐ {selectedBranch.rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {selectedBranch.address}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Stollar: {selectedBranch.occupiedTables}/{selectedBranch.totalTables} band
              </span>
              <span className={`font-bold ${selectedBranch.occupiedTables >= selectedBranch.totalTables ? 'text-rose-500' : 'text-emerald-500'}`}>
                {selectedBranch.occupiedTables >= selectedBranch.totalTables ? 'Peak 100%' : 'Faol'}
              </span>
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
            placeholder="Filial yoki shahar bo'yicha qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
          />
        </div>

        {/* Branch Chips/Cards List */}
        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 scrollbar-thin">
          {filteredRestaurants.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Filial topilmadi
            </div>
          ) : (
            filteredRestaurants.map((branch) => {
              const isSelected = selectedBranch?.id === branch.id
              const isBusy = branch.occupiedTables >= branch.totalTables

              return (
                <div
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-950/30 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <Building size={14} className={isSelected ? 'text-orange-500' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {branch.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {branch.address}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <Users size={12} className="text-slate-400" />
                      <span>{branch.occupiedTables}/{branch.totalTables}</span>
                    </div>
                    <span className={`inline-block text-[10px] font-bold ${isBusy ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {isBusy ? '100% Band' : 'Ochiq'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal to add new Branch */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Yangi Restoran Filialini Qo'shish"
        >
          <form onSubmit={handleAddBranchSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Filial Nomi *
              </label>
              <Input
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="masalan: RestoFlow Buyuk Ipak Yuli"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Manzil *
              </label>
              <Input
                value={newBranch.address}
                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                placeholder="masalan: Mirzo Ulug'bek ko'chasi 15-uy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shahar
                </label>
                <Input
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon
                </label>
                <Input
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                  placeholder="+998 71 200-00-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kenglik (Lat)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={newBranch.lat}
                  onChange={(e) => setNewBranch({ ...newBranch, lat: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Uzunlik (Lng)
                </label>
                <Input
                  type="number"
                  step="any"
                  value={newBranch.lng}
                  onChange={(e) => setNewBranch({ ...newBranch, lng: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stollar Soni
                </label>
                <Input
                  type="number"
                  value={newBranch.totalTables}
                  onChange={(e) => setNewBranch({ ...newBranch, totalTables: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" variant="primary">
                Xaritaga Qo'shish
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  )
}