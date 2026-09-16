// Til almashtirish tugmasi — uz / ru / en. i18next tilni o'zgartiradi va
// localStorage'ga saqlaydi, shuning uchun sahifa yangilanganda ham saqlanib qoladi.
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ру' },
  { code: 'en', label: 'En' },
]

const LANG_STORAGE_KEY = 'language'

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()

  const setLang = (code) => {
    i18n.changeLanguage(code)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, code)
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5 dark:bg-slate-800 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            i18n.language === code
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
