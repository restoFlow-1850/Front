import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz/common.json'
import ru from './locales/ru/common.json'
import en from './locales/en/common.json'

const resources = {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
}

const STORED_LANG =
  typeof window !== 'undefined' ? window.localStorage.getItem('app:language') : null

i18n.use(initReactI18next).init({
    resources,
    lng: STORED_LANG || 'uz',
    fallbackLng: 'uz',
    interpolation: { escapeValue: false },
})

export default i18n