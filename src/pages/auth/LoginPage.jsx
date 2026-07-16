import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginSchema } from '../../features/auth/authSchemas'
import { loginRequest } from '../../api/authApi'
import { setCredentials } from '../../features/auth/authSlice'

export default function LoginPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (formData) => {
        try {
            const res = await loginRequest(formData)
            const { accessToken, user } = res.data.data ?? res.data
            dispatch(setCredentials({ user, accessToken }))
            toast.success('Xush kelibsiz!')
            navigate('/')
        } catch (err) {
            const message = err.response?.data?.message || 'Kirishda xatolik yuz berdi'
            toast.error(message)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
            >
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tizimga kirish</h1>

                <div>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="Email"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                    <input
                        {...register('password')}
                        type="password"
                        placeholder="Parol"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Yuborilmoqda...' : 'Kirish'}
                </button>
            </form>
        </div>
    )
}