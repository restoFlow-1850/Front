import { Link } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(74,47,55,0.08),_transparent_32%),linear-gradient(135deg,_#FAF7F4_0%,_#FDF9F6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#4A2F37]/10 bg-[#FDF9F6] shadow-[0_25px_80px_rgba(42,27,34,0.16)] lg:flex-row">
        <div className="flex flex-1 flex-col justify-between bg-[#4A2F37] px-8 py-10 text-[#FDF9F6] sm:px-10 lg:px-12">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#FDF9F6]/20 bg-[#FDF9F6]/10 px-3 py-1 text-sm font-medium backdrop-blur">
              RestoFlow
            </div>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
              Yangi hisob ochib, restoraningizni boshqarishni boshlang
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#FAF7F4]/80 sm:text-base">
              Barcha xizmatlarni bir joyda ko‘rib, jamoangiz bilan samarali ishlashga tayyorlaning.
            </p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-3xl font-semibold text-[#2A1B22]">Ro‘yxatdan o‘tish</h2>
            <p className="mt-2 text-sm text-[#4A2F37]/70">Ma‘lumotlarni kiriting va yangi hisob yarating.</p>
            <div className="mt-8">
              <RegisterForm />
            </div>
            <div className="mt-8 text-sm text-[#4A2F37]">
              <Link className="font-medium transition hover:text-[#2A1B22]" to="/login">
                Mavjud hisobra kiring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
