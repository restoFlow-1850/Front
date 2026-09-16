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

const savedLanguage = localStorage.getItem('language') || 'uz'

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n