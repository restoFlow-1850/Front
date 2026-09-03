import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { callWaiter, createReservation, formatSum, getTables } from "@/lib/api";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/bron")({
  head: () => ({
    meta: [
      { title: "Stol bron qilish — Uchxona kafe" },
      {
        name: "description",
        content:
          "Sana va vaqtni tanlang, bo'sh stolni ko'ring va bir necha soniyada stol bron qiling. Taomni oldindan buyurtma qilish ham mumkin.",
      },
      { property: "og:title", content: "Stol bron qilish — Uchxona kafe" },
      {
        property: "og:description",
        content: "Bo'sh stollarni ko'ring va onlayn bron qiling.",
      },
    ],
  }),
  component: BookingPage,
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

function BookingPage() {
  const days = useMemo(() => nextDays(5), []);
  const [day, setDay] = useState(days[0].value);
  const [time, setTime] = useState("19:00");
  const [tableId, setTableId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { lines, total, clear } = useCart();
  const dateISO = new Date(`${day}T${time}:00`).toISOString();

  const tables = useQuery({
    queryKey: ["tables", dateISO],
    queryFn: () => getTables(dateISO),
  });

  const reserve = useMutation({
    mutationFn: () =>
      createReservation({
        customerName: name,
        customerPhone: phone,
        table: tableId!,
        date: dateISO,
        guests,
        notes: notes || undefined,
        items: lines.length
          ? lines.map((l) => ({ product: l.id, quantity: l.quantity }))
          : undefined,
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: "Bron qabul qilindi. Tez orada siz bilan bog'lanamiz." });
      clear();
      setTableId(null);
      tables.refetch();
    },
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });

  const waiter = useMutation({
    mutationFn: () => callWaiter(tableId!),
    onSuccess: () => setMsg({ ok: true, text: "Xizmatchi chaqirildi." }),
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });

  const canSubmit = tableId && name.trim().length > 1 && phone.trim().length > 5;

  const field =
    "mt-1.5 w-full rounded-xl border border-ink/10 bg-cream/60 px-3.5 py-2.5 text-ink outline-none focus:border-plum/50 focus:ring-2 focus:ring-plum/10";

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-balance font-display text-3xl tracking-tight text-ink md:text-4xl">
          Stol band qilish
        </h1>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              key={d.value}
              onClick={() => setDay(d.value)}
              className={
                day === d.value
                  ? "rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream"
                  : "rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm text-ink"
              }
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => setTime(t)}
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

      {tables.isLoading && <p className="mt-8 text-sm text-soft">Stollar yuklanmoqda…</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(tables.data ?? []).map((t) => {
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
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 md:col-span-2">
          <button
            disabled={!tableId || waiter.isPending}
            onClick={() => waiter.mutate()}
            className="text-sm font-medium text-plum hover:underline disabled:text-soft disabled:no-underline"
          >
            Xizmatchini chaqirish
          </button>
          <button
            disabled={!canSubmit || reserve.isPending}
            onClick={() => reserve.mutate()}
            className="rounded-full bg-plum px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-plum/90 disabled:bg-ink/15 disabled:text-soft"
          >
            {reserve.isPending ? "Yuborilmoqda…" : "Bronni tasdiqlash"}
          </button>
        </div>
      </div>
    </main>
  );
}
