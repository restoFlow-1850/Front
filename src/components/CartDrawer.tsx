import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatSum } from "@/lib/api";

export function CartDrawer() {
  const { open, setOpen, lines, total, setQty } = useCart();
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-[88%] max-w-sm animate-[rise_.5s_cubic-bezier(.32,.72,0,1)_both]">
        <div className="flex h-full w-full flex-col border-l border-ink/10 bg-paper/90 shadow-[-30px_0_60px_-40px_rgba(122,51,69,.5)] backdrop-blur-2xl">
          <div className="flex h-16 items-center justify-between border-b border-ink/5 px-6">
            <h3 className="font-display text-xl text-ink">Sizning savatingiz</h3>
            <button onClick={() => setOpen(false)} className="text-sm text-soft hover:text-ink">
              Yopish
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {lines.length === 0 && (
              <p className="text-sm text-soft">Savat hozircha bo'sh. Menyudan taom tanlang.</p>
            )}
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-display text-ink">{l.name}</p>
                  <p className="text-xs text-soft">{formatSum(l.price)} so'm</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(l.id, l.quantity - 1)}
                    className="grid size-7 place-items-center rounded-full border border-ink/15 text-ink hover:bg-paper"
                  >
                    –
                  </button>
                  <span className="w-4 text-center text-sm text-ink">{l.quantity}</span>
                  <button
                    onClick={() => setQty(l.id, l.quantity + 1)}
                    className="grid size-7 place-items-center rounded-full bg-plum text-cream"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-ink/5 px-6 pb-6 pt-4">
            <div className="flex items-center justify-between text-sm text-soft">
              <span>Jami</span>
              <span className="font-display text-2xl text-ink">
                {formatSum(total)} <span className="font-sans text-sm text-soft">so'm</span>
              </span>
            </div>
            <Link
              to="/bron"
              onClick={() => setOpen(false)}
              className="mt-4 block w-full rounded-full bg-plum py-3.5 text-center text-sm font-medium text-cream transition-colors hover:bg-plum/90"
            >
              Rasmiylashtirish
            </Link>
            <p className="mt-3 text-center text-xs text-soft">
              Buyurtma stol broni bilan birga rasmiylashtiriladi
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
