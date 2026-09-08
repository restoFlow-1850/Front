import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RESTAURANTS } from "@/lib/restaurants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RestoFlow — restoranlar, menyu va onlayn stol broni" },
      {
        name: "description",
        content:
          "RestoFlow orqali shahardagi restoran va kafelarni ko'ring, menyudan taom tanlang va stolni onlayn bron qiling.",
      },
      { property: "og:title", content: "RestoFlow — restoranlar va onlayn stol broni" },
      {
        property: "og:description",
        content: "Restoranlarni tanlang, menyuni ko'ring va stolingizni bir necha soniyada bron qiling.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("all");

  const cuisines = ["all", ...new Set(RESTAURANTS.map((r) => r.cuisine.split(" · ")[0] ?? ""))];

  const list = RESTAURANTS.filter((r) => {
    const okC = cuisine === "all" || r.cuisine.startsWith(cuisine);
    const t = q.trim().toLowerCase();
    const okQ =
      !t ||
      r.name.toLowerCase().includes(t) ||
      r.cuisine.toLowerCase().includes(t) ||
      r.district.toLowerCase().includes(t);
    return okC && okQ;
  });

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="animate-[fadeUp_.7s_cubic-bezier(.32,.72,0,1)_both] pb-8 pt-16 md:pt-20">
        <span className="inline-block rounded-full bg-mint/70 px-3 py-1 text-xs font-medium text-ink">
          Toshkent
        </span>
        <h1 className="mt-5 max-w-[18ch] text-balance font-display text-5xl leading-[1.02] tracking-tight text-ink md:text-6xl">
          Restoranni tanlang, <span className="italic text-plum">stolni bron qiling</span>.
        </h1>
        <p className="mt-5 max-w-[52ch] text-pretty text-soft">
          RestoFlow — bitta joyda menyu, narxlar va bo'sh stollar. Restoranga kiring, taom tanlang va
          bron qiling.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Restoran, oshxona yoki tuman bo'yicha qidiring"
            className="w-full max-w-sm rounded-full border border-ink/10 bg-paper/70 px-5 py-3 text-sm text-ink outline-none placeholder:text-soft focus:border-plum/40 focus:ring-2 focus:ring-plum/10"
          />
          <span className="text-sm text-soft">{list.length} ta joy</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={
                cuisine === c
                  ? "rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream"
                  : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
              }
            >
              {c === "all" ? "Barchasi" : c}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Link
              key={r.slug}
              to="/restoran/$slug"
              params={{ slug: r.slug }}
              className="card group block overflow-hidden rounded-[22px] border border-ink/5 bg-paper/80 backdrop-blur-md"
            >
              <div className="relative">
                <img
                  src={r.image}
                  alt={`${r.name} restorani zali`}
                  loading="lazy"
                  width={1200}
                  height={896}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
                  {r.rating.toFixed(1)} ★ · {r.reviews}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl text-ink">{r.name}</h2>
                  <span className="mt-1 text-sm text-soft">{r.priceLevel}</span>
                </div>
                <p className="mt-1 text-sm text-soft">{r.cuisine}</p>
                <p className="mt-3 text-sm text-soft">
                  {r.district} · {r.hours}
                </p>
                <span className="mt-4 inline-block rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-cream transition-colors group-hover:bg-plum">
                  Menyu va bron
                </span>
              </div>
            </Link>
          ))}
        </div>
        {list.length === 0 && (
          <p className="mt-10 text-sm text-soft">Bunday restoran topilmadi.</p>
        )}
      </section>
    </main>
  );
}
