// Yandex Maps JS API 2.1 ni bir marta dinamik yuklaydi.
// Kalit: VITE_YANDEX_MAPS_API_KEY (Yandex Developer Cabinet → "JavaScript API va HTTP Geocoder").
let loadPromise = null

export const YANDEX_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY || ''

export function loadYandexMaps() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.ymaps) return new Promise((resolve) => window.ymaps.ready(() => resolve(window.ymaps)))
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(YANDEX_KEY)}&lang=ru_RU`
    script.async = true
    script.onload = () => window.ymaps.ready(() => resolve(window.ymaps))
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Yandex Maps yuklanmadi'))
    }
    document.head.appendChild(script)
  })
  return loadPromise
}
