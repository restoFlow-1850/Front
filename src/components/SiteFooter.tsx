import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-ink/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-ink">
            RestoFlow<span className="text-plum">.</span>
          </p>
          <p className="mt-3 max-w-[34ch] text-sm text-soft">
            Toshkentdagi restoran va kafelar menyusi, narxlari va onlayn stol broni.
          </p>
        </div>
        <div className="text-sm text-soft">
          <p className="mb-2 font-medium text-ink">Bo'limlar</p>
          <Link to="/" className="block hover:text-ink">
            Restoranlar
          </Link>
          <Link to="/aloqa" className="mt-1 block hover:text-ink">
            Aloqa
          </Link>
        </div>
        <div className="text-sm text-soft">
          <p className="mb-2 font-medium text-ink">Ijtimoiy</p>
          <a href="#" className="block hover:text-ink">
            Instagram
          </a>
          <a href="#" className="mt-1 block hover:text-ink">
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}
