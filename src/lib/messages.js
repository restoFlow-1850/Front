import en from '../locales/en/common.json'
import ru from '../locales/ru/common.json'
import uz from '../locales/uz/common.json'

const resources = { en, ru, uz }

export function translate(key, values = {}) {
  const language = typeof localStorage === 'undefined' ? 'uz' : localStorage.getItem('language') || 'uz'
  const table = resources[language] ?? resources.uz
  const value = key.split('.').reduce((current, part) => current?.[part], table)
  if (typeof value !== 'string') return key
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] ?? '')
}

export function subscriptionExpiredMessage() {
  return translate('subscription.expiredToast')
}
