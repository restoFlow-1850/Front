import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiStar, FiArrowRight, FiBookOpen } from 'react-icons/fi'

// Restoran kartasi — bosilganda mehmon menyusiga (/guest) olib boradi.
// Tanlangan restoran sessionStorage'ga yoziladi: /guest sahifasi "X restoran
// menyusi" sarlavhasini ko'rsatish uchun shu ma'lumotni o'qiydi (Abdugani).
export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate()
  const { name, slug, address, cuisine, rating, image, description } = restaurant

  // Kartani bosganda: restoran kontekstini saqlab, mehmon menyusiga o'tamiz.
  function openGuestMenu() {
    try {
      sessionStorage.setItem(
        'guestRestaurant',
        JSON.stringify({ name, slug, address, cuisine }),
      )
    } catch {
      // sessionStorage band bo'lsa ham menyuning ochilishiga xalaqit bermaymiz
    }
    navigate('/guest')
  }

  return (
    <button
      type="button"
      onClick={openGuestMenu}
      className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#4a1616] bg-[#1c0a0b] text-left shadow-sm transition-all hover:border-[#C89B5E]/40 hover:shadow-lg hover:shadow-[#C89B5E]/5"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#2a1315]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🍽️
          </div>
        )}

        {/* Rating badge */}
        {rating != null && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#140708]/80 px-2.5 py-1 backdrop-blur">
            <FiStar className="h-3.5 w-3.5 fill-[#C89B5E] text-[#C89B5E]" />
            <span className="text-xs font-semibold text-[#E6DCDC]">
              {Number(rating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#E6DCDC] group-hover:text-[#D9A968]">
            {name}
          </h3>
          <FiArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8a7373] transition-transform group-hover:translate-x-1 group-hover:text-[#C89B5E]" />
        </div>

        {cuisine && (
          <span className="mt-1 inline-block rounded-full bg-[#C89B5E]/10 px-2.5 py-0.5 text-xs font-medium text-[#C89B5E]">
            {cuisine}
          </span>
        )}

        {address && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#9a8080]">
            <FiMapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        )}

        {description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#8a7373]">
            {description}
          </p>
        )}

        {/* Mehmon menyusiga o'tish */}
        <span className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-[#4a1616] py-2.5 text-sm font-medium text-[#cbbcbc] transition group-hover:border-[#C89B5E]/40 group-hover:bg-[#C89B5E]/5 group-hover:text-[#D9A968]">
          <FiBookOpen className="h-4 w-4" />
          Menyuni ko'rish
        </span>
      </div>
    </button>
  )
}
