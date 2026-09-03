import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVenue } from "@/lib/api";

export const Route = createFileRoute("/aloqa")({
  head: () => ({
    meta: [
      { title: "Aloqa — Uchxona kafe" },
      {
        name: "description",
        content: "Uchxona kafe manzili, ish vaqti va telefon raqami. Savollaringiz bo'lsa yozing.",
      },
      { property: "og:title", content: "Aloqa — Uchxona kafe" },
      { property: "og:description", content: "Manzil, ish vaqti va telefon raqamimiz." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const venue = useQuery({ queryKey: ["venue"], queryFn: getVenue });
  const v = venue.data;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-balance font-display text-3xl tracking-tight text-ink md:text-4xl">
        Aloqa
      </h1>
      <p className="mt-3 max-w-[46ch] text-pretty text-soft">
        {v?.description ?? "Sizni kutib qolamiz."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-ink/5 bg-paper/80 p-6 backdrop-blur-md">
          <p className="text-sm text-soft">Manzil</p>
          <p className="mt-1 font-display text-xl text-ink">{v?.address ?? "Toshkent"}</p>
        </div>
        <div className="rounded-[22px] border border-ink/5 bg-paper/80 p-6 backdrop-blur-md">
          <p className="text-sm text-soft">Telefon</p>
          <a href={`tel:${v?.phone ?? ""}`} className="mt-1 block font-display text-xl text-ink">
            {v?.phone ?? "—"}
          </a>
        </div>
        <div className="rounded-[22px] border border-ink/5 bg-paper/80 p-6 backdrop-blur-md">
          <p className="text-sm text-soft">Ish vaqti</p>
          <p className="mt-1 font-display text-xl text-ink">
            {v?.openingTime ?? "08:00"} — {v?.closingTime ?? "22:00"}
          </p>
        </div>
      </div>
    </main>
  );
}
