import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
    uz: {
        translation: {
            welcome: 'Xush kelibsiz',
        },
    },
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'uz',
        fallbackLng: 'uz',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n