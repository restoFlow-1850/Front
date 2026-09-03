import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCategories, getProducts } from "@/lib/api";
import { MenuCard } from "@/components/MenuCard";

export const Route = createFileRoute("/menyu")({
  head: () => ({
    meta: [
      { title: "Menyu — Uchxona kafe" },
      {
        name: "description",
        content:
          "Uchxona menyusi: issiq taomlar, salatlar, choy va shirinliklar. Narxlarni ko'ring va savatga qo'shing.",
      },
      { property: "og:title", content: "Menyu — Uchxona kafe" },
      {
        property: "og:description",
        content: "Issiq taomlar, salatlar, choy va shirinliklar — savatga qo'shib bron qiling.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState<string>("all");
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const list = (products.data ?? []).filter((p) => {
    if (active === "all") return true;
    const cid = typeof p.category === "string" ? p.category : p.category?._id;
    return cid === active;
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-balance font-display text-3xl tracking-tight text-ink md:text-4xl">
          Menyu
        </h1>
        <p className="text-sm text-soft">Narxlar UZS da</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={
            active === "all"
              ? "rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream"
              : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
          }
        >
          Barchasi
        </button>
        {(categories.data ?? []).map((c) => (
          <button
            key={c._id}
            onClick={() => setActive(c._id)}
            className={
              active === c._id
                ? "rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream"
                : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {products.isLoading && <p className="mt-8 text-sm text-soft">Yuklanmoqda…</p>}
      {products.isError && (
        <p className="mt-8 text-sm text-plum">Menyuni yuklab bo'lmadi. Keyinroq urinib ko'ring.</p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <MenuCard key={p._id} product={p} index={i} />
        ))}
      </div>
      {!products.isLoading && list.length === 0 && (
        <p className="mt-8 text-sm text-soft">Bu bo'limda hozircha taom yo'q.</p>
      )}
    </main>
  );
}
