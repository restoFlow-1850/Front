import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary tutib qoldi:', error, info)
    }

    handleReset = () => {
        this.setState({ hasError: false })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-900">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Nimadir xato ketdi
                    </h1>
                    <p className="max-w-md text-gray-500 dark:text-gray-400">
                        Kutilmagan xatolik yuz berdi. Sahifani yangilab ko'ring yoki bosh sahifaga qayting.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Bosh sahifaga qaytish
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}