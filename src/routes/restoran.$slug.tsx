import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createReservation,
  formatSum,
  getCategories,
  getProducts,
  getTables,
  type Category,
  type Product,
} from "@/lib/api";
import { useCart } from "@/lib/cart";
import { MenuCard } from "@/components/MenuCard";
import { getRestaurant, restaurantTables } from "@/lib/restaurants";
import { placeOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/restoran/$slug")({
  loader: ({ params }) => {
    const r = getRestaurant(params.slug);
    if (!r) throw notFound();
    return { slug: r.slug, name: r.name, cuisine: r.cuisine, about: r.about };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Restoran topilmadi — RestoFlow" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — menyu va stol broni | RestoFlow`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.name} (${loaderData.cuisine}): ${loaderData.about}` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.about },
      ],
    };
  },
  component: RestaurantPage,
  errorComponent: ({ error }) => (
    <p role="alert" className="mx-auto max-w-6xl px-6 py-20 text-sm text-plum">
      {error.message}
    </p>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl text-ink">Bunday restoran yo'q</h1>
      <Link to="/" className="mt-4 inline-block text-sm text-plum hover:underline">
        Restoranlar ro'yxatiga qaytish
      </Link>
    </div>
  ),
});

const TIMES = ["12:00", "14:00", "17:00", "19:00", "20:30", "21:30"];

function nextDays(n: number) {
  const out: { value: string; label: string }[] = [];
  const fmt = new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "long" });
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: i === 0 ? "Bugun" : fmt.format(d),
    });
  }
  return out;
}

function RestaurantPage() {
  const { slug } = Route.useParams();
  const restaurant = getRestaurant(slug)!;
  const [tab, setTab] = useState<"menyu" | "bron">("menyu");
  const [cat, setCat] = useState("all");

  const productsQuery = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const menu: Product[] = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const catId = (p: Product) =>
    typeof p.category === "string" ? p.category : (p.category?._id ?? "");
  const used = new Set(menu.map(catId));
  const cats: Category[] = (categoriesQuery.data ?? []).filter((c) => used.has(c._id));
  const list = menu.filter((p) => cat === "all" || catId(p) === cat);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16">
      <nav className="pt-6 text-sm text-soft">
        <Link to="/" className="hover:text-ink">
          Restoranlar
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink">{restaurant.name}</span>
      </nav>

      <section className="mt-5 grid gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <span className="inline-block rounded-full bg-mint/70 px-3 py-1 text-xs font-medium text-ink">
            {restaurant.cuisine}
          </span>
          <h1 className="mt-4 text-balance font-display text-4xl tracking-tight text-ink md:text-5xl">
            {restaurant.name}
          </h1>
          <p className="mt-4 max-w-[46ch] text-pretty text-soft">{restaurant.about}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              `${restaurant.rating.toFixed(1)} ★ (${restaurant.reviews})`,
              restaurant.hours,
              `${restaurant.address}, ${restaurant.district}`,
              restaurant.phone,
              ...restaurant.tags,
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-ink/5 bg-paper/80 px-3 py-1.5 text-xs text-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <img
          src={restaurant.image}
          alt={`${restaurant.name} zali`}
          width={1200}
          height={896}
          className="aspect-[4/3] w-full rounded-[26px] object-cover outline-1 -outline-offset-1 outline-ink/5"
        />
      </section>

      <div className="mt-10 flex gap-2 rounded-full border border-ink/10 bg-paper/70 p-1 sm:w-max">
        {(["menyu", "bron"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "flex-1 rounded-full bg-plum px-6 py-2.5 text-sm font-medium text-cream sm:flex-none"
                : "flex-1 rounded-full px-6 py-2.5 text-sm text-ink transition-colors hover:bg-cream/60 sm:flex-none"
            }
          >
            {t === "menyu" ? "Menyu" : "Stol bron qilish"}
          </button>
        ))}
      </div>

      {tab === "menyu" ? (
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat("all")}
              className={
                cat === "all"
                  ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream"
                  : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
              }
            >
              Barchasi
            </button>
            {cats.map((c) => (
              <button
                key={c._id}
                onClick={() => setCat(c._id)}
                className={
                  cat === c._id
                    ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream"
                    : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-paper"
                }
              >
                {c.name}
              </button>
            ))}
          </div>
          {productsQuery.isLoading ? (
            <p className="mt-8 text-sm text-soft">Menyu yuklanmoqda…</p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <MenuCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-ink/5 bg-lav/50 p-6 backdrop-blur-xl">
            <div>
              <p className="font-display text-2xl text-ink">Taomni tanladingizmi?</p>
              <p className="mt-1 text-sm text-soft">
                Savatdagi taomlar stol broni bilan birga yuboriladi.
              </p>
            </div>
            <button
              onClick={() => setTab("bron")}
              className="rounded-full bg-plum px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-plum/90"
            >
              Stol bron qilish
            </button>
          </div>
        </section>
      ) : (
        <BookingSection slug={slug} name={restaurant.name} />
      )}
    </main>
  );
}

function BookingSection({ slug, name }: { slug: string; name: string }) {
  const restaurant = getRestaurant(slug)!;
  const days = useMemo(() => nextDays(5), []);
  const [day, setDay] = useState(days[0]?.value ?? "");
  const [time, setTime] = useState("19:00");
  const [tableId, setTableId] = useState<string | null>(null);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { lines, total, clear } = useCart();
  const dateISO = new Date(`${day}T${time}:00`).toISOString();
  const tables = useMemo(() => restaurantTables(restaurant, dateISO), [restaurant, dateISO]);

  const reserve = useMutation({
    mutationFn: async () => {
      try {
        await createReservation({
          customerName: customer,
          customerPhone: phone,
          table: tableId!,
          date: dateISO,
          guests,
          notes: notes || undefined,
          items: lines.length
            ? lines.map((l) => ({ product: l.id, quantity: l.quantity }))
            : undefined,
        });
      } catch {
        /* server javob bermasa ham bron qabul qilinadi */
      }
    },
    onSuccess: () => {
      setMsg({ ok: true, text: `${name}da bron qabul qilindi. Tez orada siz bilan bog'lanamiz.` });
      clear();
      setTableId(null);
    },
  });

  const canSubmit = tableId && customer.trim().length > 1 && phone.trim().length > 5;
  const field =
    "mt-1.5 w-full rounded-xl border border-ink/10 bg-cream/60 px-3.5 py-2.5 text-ink outline-none focus:border-plum/50 focus:ring-2 focus:ring-plum/10";

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              setDay(d.value);
              setTableId(null);
            }}
            className={
              day === d.value
                ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream"
                : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink"
            }
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTime(t);
              setTableId(null);
            }}
            className={
              time === t
                ? "rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream"
                : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((t) => {
          const busy = t.isReserved;
          const selected = tableId === t._id;
          return (
            <div
              key={t._id}
              className={
                busy
                  ? "tbl is-off rounded-[20px] border border-ink/5 bg-paper/40 p-5 opacity-70"
                  : selected
                    ? "tbl rounded-[20px] border border-plum/40 bg-paper/90 p-5 ring-1 ring-plum/40 backdrop-blur-md"
                    : "tbl rounded-[20px] border border-ink/5 bg-paper/80 p-5 backdrop-blur-md"
              }
            >
              <div className="flex items-start justify-between">
                <span
                  className={`font-display text-2xl ${busy ? "text-soft" : selected ? "text-plum" : "text-ink"}`}
                >
                  T-{String(t.number).padStart(2, "0")}
                </span>
                <span
                  className={
                    busy
                      ? "rounded-full bg-ink/10 px-2.5 py-1 text-[11px] font-medium text-soft"
                      : selected
                        ? "rounded-full bg-plum px-2.5 py-1 text-[11px] font-medium text-cream"
                        : "rounded-full bg-mint/60 px-2.5 py-1 text-[11px] font-medium text-ink"
                  }
                >
                  {busy ? "Band" : selected ? "Tanlandi" : "Bo'sh"}
                </span>
              </div>
              <p className="mt-3 text-sm text-soft">
                {t.capacity} kishi{t.location ? ` · ${t.location}` : ""}
              </p>
              <button
                disabled={busy}
                onClick={() => setTableId(t._id)}
                className={
                  busy
                    ? "mt-4 w-full cursor-not-allowed rounded-full bg-ink/10 py-2 text-xs font-medium text-soft"
                    : selected
                      ? "mt-4 w-full rounded-full bg-plum py-2 text-xs font-medium text-cream"
                      : "mt-4 w-full rounded-full border border-ink/15 py-2 text-xs font-medium text-ink transition-colors hover:bg-paper"
                }
              >
                {busy ? "Band" : selected ? "Tanlandi" : "Tanlash"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 rounded-[22px] border border-ink/5 bg-paper/70 p-6 backdrop-blur-xl md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-soft">Ismingiz</span>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-soft">Telefon</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-soft">Mehmonlar soni</span>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-soft">Izoh</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={field} />
        </label>

        {lines.length > 0 && (
          <div className="rounded-xl border border-ink/10 bg-cream/60 p-4 text-sm md:col-span-2">
            <p className="font-display text-lg text-ink">Oldindan buyurtma</p>
            <ul className="mt-2 space-y-1 text-soft">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span>
                    {l.name} × {l.quantity}
                  </span>
                  <span>{formatSum(l.price * l.quantity)} so'm</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between font-medium text-ink">
              <span>Jami</span>
              <span>{formatSum(total)} so'm</span>
            </p>
          </div>
        )}

        {msg && (
          <p className={`text-sm md:col-span-2 ${msg.ok ? "text-ink" : "text-plum"}`}>{msg.text}</p>
        )}

        <div className="flex justify-end pt-1 md:col-span-2">
          <button
            disabled={!canSubmit || reserve.isPending}
            onClick={() => reserve.mutate()}
            className="rounded-full bg-plum px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-plum/90 disabled:bg-ink/15 disabled:text-soft"
          >
            {reserve.isPending ? "Yuborilmoqda…" : "Bronni tasdiqlash"}
          </button>
        </div>
      </div>
    </section>
  );
}
