import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getVenue } from "@/lib/api";
import { MenuCard } from "@/components/MenuCard";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uchxona — kafe menyusi va onlayn stol broni" },
      {
        name: "description",
        content:
          "Uchxona kafe: iliq taomlar menyusi, onlayn buyurtma va bir necha soniyada stol bron qilish.",
      },
      { property: "og:title", content: "Uchxona — kafe menyusi va onlayn stol broni" },
      {
        property: "og:description",
        content: "Menyuni ko'ring, taom tanlang va stolingizni onlayn bron qiling.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const venue = useQuery({ queryKey: ["venue"], queryFn: getVenue });
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const v = venue.data;
  const featured = (products.data ?? []).slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="animate-[fadeUp_.7s_cubic-bezier(.32,.72,0,1)_both] pb-10 pt-16 md:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-block rounded-full bg-mint/70 px-3 py-1 text-xs font-medium text-ink">
              {v?.address ?? "Toshkent"}
            </span>
            <h1 className="mt-5 text-balance font-display text-5xl leading-[1.02] tracking-tight text-ink md:text-6xl">
              Sokin, iliq <span className="italic text-plum">choy va non</span> uchun.
            </h1>
            <p className="mt-5 max-w-[42ch] text-pretty text-soft">
              {v?.description ??
                "Oz miqdorda, iliq tayyorlangan taomlar va sekin qaynagan choy. Kunni sekin boshlang."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-ink/5 bg-paper/80 px-3 py-1.5 text-xs text-soft">
                {v?.openingTime ?? "08:00"} — {v?.closingTime ?? "22:00"}
              </span>
              <span className="rounded-full border border-ink/5 bg-paper/80 px-3 py-1.5 text-xs text-soft">
                {v?.phone ?? "+998 71 200 45 67"}
              </span>
              <span className="rounded-full border border-ink/5 bg-paper/80 px-3 py-1.5 text-xs text-soft">
                {v?.rating ?? 4.9} ★ ({v?.reviewsCount ?? 0})
              </span>
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                to="/menyu"
                className="rounded-full bg-plum px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-plum/90"
              >
                Menyuni o'qish
              </Link>
              <Link
                to="/bron"
                className="rounded-full border border-ink/15 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                Stol band qilish
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Uchxona kafesida choynak va issiq non"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full rounded-[28px] object-cover outline-1 -outline-offset-1 outline-ink/5"
            />
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-ink/5 bg-paper/85 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(122,51,69,.4)] backdrop-blur-xl">
              <p className="text-xs text-soft">Bugungi taom</p>
              <p className="font-display text-lg text-ink">
                {featured[0]?.name ?? "Somsa bilan choy"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-balance font-display text-3xl tracking-tight text-ink md:text-4xl">
            Menyu
          </h2>
          <Link to="/menyu" className="text-sm text-plum hover:underline">
            Barchasi
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <MenuCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
