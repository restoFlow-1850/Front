import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export function SiteHeader({ rating }: { rating?: number }) {
  const { count, setOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-display text-2xl tracking-tight text-ink">
          Uchxona<span className="text-plum">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-soft md:flex">
          <Link to="/menyu" className="transition-colors hover:text-ink" activeProps={{ className: "text-ink" }}>
            Menyu
          </Link>
          <Link to="/bron" className="transition-colors hover:text-ink" activeProps={{ className: "text-ink" }}>
            Bron
          </Link>
          <Link to="/aloqa" className="transition-colors hover:text-ink" activeProps={{ className: "text-ink" }}>
            Aloqa
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-butter/70 px-3 py-1.5 text-xs font-medium text-ink sm:flex">
            {rating?.toFixed(1) ?? "4.9"} <span className="text-plum">★</span>
          </span>
          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-plum/90"
          >
            Savat
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-cream text-[11px] font-semibold text-plum ring-1 ring-plum">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
