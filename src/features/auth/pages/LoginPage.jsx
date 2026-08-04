import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(74,47,55,0.08),_transparent_32%),linear-gradient(135deg,_#FAF7F4_0%,_#FDF9F6_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#4A2F37]/10 bg-[#FDF9F6] shadow-[0_25px_80px_rgba(42,27,34,0.16)] lg:min-h-[calc(100vh-4rem)] lg:flex-row">

        {/* Chap panel */}
        <div className="flex flex-col justify-center bg-[#2A1B22] px-6 py-10 text-[#FDF9F6] sm:px-10 sm:py-14 lg:w-1/2 lg:px-12 lg:py-16">
          <div className="max-w-md">
            <div className="inline-flex items-center rounded-full border border-[#FDF9F6]/20 bg-[#FDF9F6]/10 px-3 py-1 text-sm font-medium backdrop-blur">
              RestoFlow
            </div>

            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Salom, Behruz! 👋
            </h1>

            <p className="mt-5 text-sm leading-7 text-[#FAF7F4]/80 sm:text-base">
              Restoran operatsiyalaringizni bir joyda kuzatib boring —
              buyurtmalar, stol, personal va hisobotlar bir tizimda.
            </p>
          </div>
        </div>

        {/* O'ng panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="w-full max-w-md">

            <h2 className="text-3xl font-semibold text-[#2A1B22] sm:text-4xl">
              Xush kelibsiz, Behruz!
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#4A2F37]/70">
              Hisobingizga kirib, boshqaruv panelini oching.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>

            <div className="mt-8 flex flex-col gap-3 text-sm text-[#4A2F37] sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/register"
                className="font-medium transition hover:text-[#2A1B22]"
              >
                Ro‘yxatdan o‘tish
              </Link>

              <Link
                to="/forgot-password"
                className="font-medium transition hover:text-[#2A1B22]"
              >
                Parolni unutdingizmi?
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}