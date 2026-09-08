export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-bold text-indigo-600">RestoFlow</a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-gray-600 transition hover:text-indigo-600">
              Kirish
            </a>
            <a href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Boshlash
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">Mijozlarimiz</h1>
        <p className="mt-4 text-lg text-indigo-100">
          RestoFlow ni ishlatayotgan restoranlar va ularning tajribalari
        </p>
      </section>

      {/* Clients grid */}
      <section className="container mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-12 md:grid-cols-3">
        {[
          { name: 'Oshxona', role: 'Toshkent', quote: 'Buyurtmalar 3 baravar tezlashdi. Oshxona bilan aloqa juda qulay.' },
          { name: 'La Piazza', role: 'Samarqand', quote: 'Stollar xaritasi juda qulay — ofitsiantlar yangi kelganlar ham tushunadi.' },
          { name: 'Sushi Master', role: 'Buxoro', quote: 'Kassa avtomatlashtirildi, xatoliklar deyarli yo\'qoldi.' },
          { name: 'Choyxona Milliy', role: 'Farg\'ona', quote: 'Dashboard orqali savdo tushunchasini hozir ko\'raman.' },
          { name: 'BBQ House', role: 'Qarshi', quote: 'Mijozlar uchun QR menyu juda zamonaviy ko\'rinadi.' },
          { name: 'Nonvoy Uy', role: 'Urgench', quote: 'Bron tizimi bilan navbat muammosi hal bo\'ldi.' },
        ].map((c) => (
          <div key={c.name} className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-gray-600 italic">"{c.quote}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {c.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.role}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">Restorani hozir boshlang</h2>
        <p className="mt-2 text-indigo-100">Bepul ro'yxatdan o'ting va 14 kunlik sinov muddatini boshlang.</p>
        <a
          href="/register"
          className="mt-6 inline-block rounded-xl bg-yellow-400 px-8 py-3 font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300"
        >
          Bepul boshlash →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} RestoFlow. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  )
}
