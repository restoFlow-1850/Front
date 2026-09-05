import type { Venue } from "@/lib/api";

export function SiteFooter({ venue }: { venue?: Venue | undefined }) {
  return (
    <footer className="mt-6 border-t border-ink/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-ink">
            Uchxona<span className="text-plum">.</span>
          </p>
          <p className="mt-3 max-w-[34ch] text-sm text-soft">
            {venue?.address ?? "Toshkent"} · {venue?.openingTime ?? "08:00"} —{" "}
            {venue?.closingTime ?? "22:00"}.
          </p>
        </div>
        <div className="text-sm text-soft">
          <p className="mb-2 font-medium text-ink">Manzil</p>
          <p>{venue?.address ?? "Toshkent"}</p>
          <p className="mt-2 font-medium text-ink">Telefon</p>
          <p>{venue?.phone ?? "+998 71 200 45 67"}</p>
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
