import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Fayoz: refresh token interceptor shu yerga qo'shiladi
// (401 kelganda /auth/refresh chaqirib, so'rovni qayta yuborish)