import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerSchema } from '../../features/auth/authSchemas'
import { registerRequest } from '../../api/authApi'

export default function RegisterPage() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(registerSchema) })

    const onSubmit = async (formData) => {
        try {
            await registerRequest(formData)
            toast.success('Ro\'yxatdan o\'tildi, endi kiring')
            navigate('/login')
        } catch (err) {
            const message = err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik'
            toast.error(message)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
            >
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ro'yxatdan o'tish</h1>

                <div>
                    <input {...register('name')} placeholder="Ism" className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white" />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <input {...register('email')} type="email" placeholder="Email" className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white" />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                    <input {...register('password')} type="password" placeholder="Parol" className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white" />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                    <input {...register('phone')} placeholder="Telefon (+998...)" className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white" />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                    <select {...register('role')} className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white">
                        <option value="">Rolni tanlang</option>
                        <option value="admin">Admin</option>
                        <option value="waiter">Ofitsiant</option>
                        <option value="cook">Oshpaz</option>
                        <option value="cashier">Kassir</option>
                    </select>
                    {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Hisobingiz bormi? <Link to="/login" className="text-blue-600">Kirish</Link>
                </p>
            </form>
        </div>
    )
}