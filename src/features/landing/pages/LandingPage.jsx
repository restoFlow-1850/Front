export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      {/* Navbar */}
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">RestoFlow</h1>
        <div className="flex items-center gap-4">
          <a href="/login" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20">
            Kirish
          </a>
          <a href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
            Ro'yxatdan o'tish
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto flex flex-col items-center px-6 py-24 text-center">
        <h2 className="max-w-3xl text-5xl font-extrabold leading-tight md:text-6xl">
          Restoraningizni <span className="text-yellow-300">smart</span> boshqaring
        </h2>
        <p className="mt-6 max-w-xl text-lg text-white/80">
          Buyurtmalar, stollar, oshxona va kassa — barchasi bir platformada.
          Real-vaqtda boshqaruv, tezkor va oson.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/register"
            className="rounded-xl bg-yellow-400 px-8 py-3 text-lg font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300"
          >
            Bepul boshlash →
          </a>
          <a
            href="/clients"
            className="rounded-xl border-2 border-white/30 px-8 py-3 text-lg font-semibold backdrop-blur transition hover:bg-white/10"
          >
            Mijozlar sahifasi
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: '📋',
            title: 'Buyurtmalar',
            desc: 'Ofitsiantlar tezkor ravishda buyurtma oladi, oshxona real-vaqtda ko\'radi.',
          },
          {
            icon: '🪑',
            title: 'Stollar xaritasi',
            desc: 'Stol holatini xaritada ko\'ring — band, bo\'sh, bron qilingan.',
          },
          {
            icon: '📊',
            title: 'Dashboard & Kassa',
            desc: 'Statistika, grafiklar, to\'lov va chek chiqarish — avtomatik.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl bg-white/10 p-8 backdrop-blur transition hover:bg-white/15"
          >
            <div className="text-4xl">{f.icon}</div>
            <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-white/70">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        © {new Date().getFullYear()} RestoFlow. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  )
}
