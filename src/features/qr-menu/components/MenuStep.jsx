import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { resolveImageUrl, formatSum } from '../api'

export default function MenuStep({
  categories,
  products,
  isLoading,
  activeCategory,
  onCategoryChange,
  cart,
  onQtyChange,
  cartCount,
  cartTotal,
  onBack,
  onNext,
}) {
  const filtered = activeCategory
    ? products.filter((p) => p.category?._id === activeCategory)
    : products

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-[#E6DCDC]">Taomlar va ichimliklar</h2>
        <p className="text-sm text-[#9a8080]">
          Xohlasangiz oldindan buyurtma bering — stolga kelganingizda tayyor kutib turadi. Bu qadamni o'tkazib yuborishingiz ham mumkin.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !activeCategory
              ? 'bg-[#C89B5E] text-[#2a0e10]'
              : 'bg-[#2a1315] text-[#cbbcbc] hover:bg-[#3a1a1c]'
          }`}
        >
          Barchasi
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => onCategoryChange(cat._id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === cat._id
                ? 'bg-[#C89B5E] text-[#2a0e10]'
                : 'bg-[#2a1315] text-[#cbbcbc] hover:bg-[#3a1a1c]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#8a7373]">
          Menyu yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#8a7373]">
          Bu bo'limda mahsulot topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((product) => {
            const qty = cart[product._id]?.quantity || 0
            const img = resolveImageUrl(product.image)
            return (
              <div
                key={product._id}
                className="flex flex-col overflow-hidden rounded-xl border border-[#3a1a1c] bg-[#1c0a0b] shadow-sm"
              >
                <div className="flex h-28 items-center justify-center bg-[#2a1315]">
                  {img ? (
                    <img src={img} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl">🍽️</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-[#E6DCDC]">
                    {product.name}
                  </p>
                  <p className="mt-auto text-sm font-bold text-[#D9A968]">
                    {formatSum(product.price)}
                  </p>
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => onQtyChange(product, 1)}
                      className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#C89B5E] py-1.5 text-xs font-semibold text-[#2a0e10] hover:bg-[#D9A968]"
                    >
                      <FiPlus size={13} /> Qo'shish
                    </button>
                  ) : (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-[#2a1315] px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => onQtyChange(product, qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#150708] text-[#D9A968] shadow-sm"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="text-sm font-semibold text-[#E6DCDC]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => onQtyChange(product, qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#150708] text-[#D9A968] shadow-sm"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[#4a1616] bg-[#140708]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#cbbcbc] hover:bg-[#2a1315]"
          >
            Orqaga
          </button>
          <div className="flex items-center gap-4">
            {cartCount > 0 && (
              <span className="flex items-center gap-2 text-sm font-medium text-[#cbbcbc]">
                <FiShoppingCart /> {cartCount} ta · {formatSum(cartTotal)}
              </span>
            )}
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-[#C89B5E] px-6 py-2.5 text-sm font-semibold text-[#2a0e10] shadow-sm transition hover:bg-[#D9A968]"
            >
              {cartCount > 0 ? 'Davom etish' : "O'tkazib yuborish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
