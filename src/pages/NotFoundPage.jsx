import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-900">
            <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Sahifa topilmadi</p>
            <Link to="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Bosh sahifaga qaytish
            </Link>
        </div>
    )
}