// ROOT (superadmin) panel API client.
// Alohide JWT secret bilan token olinadi (JWT_ROOT_SECRET backend'da) va
// oddiy `api` instance'dan HAMMASI BO'LAB ajratilgan — xavfsizlik uchun.
import axios from 'axios'

const rawApiUrl = import.meta.env?.VITE_API_URL
const isDev = Boolean(import.meta.env?.DEV)
const baseURL = isDev
  ? (rawApiUrl && !rawApiUrl.startsWith('http') ? rawApiUrl : '/api')
  : (rawApiUrl || 'https://backend-production-109c0.up.railway.app/api')

const rootApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

const TOKEN_KEY = 'rootAccessToken'

export function getRootToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setRootToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

rootApi.interceptors.request.use((config) => {
  const token = getRootToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── AUTH ────────────────────────────────────────────────────────────────
export async function rootLogin(email, password) {
  const res = await rootApi.post('/root/login', { email, password })
  setRootToken(res.data?.data?.token)
  return res.data?.data
}

export function rootLogout() {
  setRootToken(null)
}

export async function rootMe() {
  const res = await rootApi.get('/root/me')
  return res.data?.data
}

// ─── STATS ───────────────────────────────────────────────────────────────
export async function getRootStats() {
  const res = await rootApi.get('/root/stats')
  return res.data?.data
}

// ─── COLLECTIONS ─────────────────────────────────────────────────────────
export async function getRootCollections() {
  const res = await rootApi.get('/root/collections')
  return res.data?.data
}

export async function getRootCollection(key, { search = '', page = 1, limit = 25 } = {}) {
  const params = { page, limit }
  if (search) params.search = search
  const res = await rootApi.get(`/root/collections/${key}`, { params })
  return { items: res.data?.data || [], pagination: res.data?.pagination, label: res.data?.message }
}

export async function getRootDocument(key, id) {
  const res = await rootApi.get(`/root/collections/${key}/${id}`)
  return res.data?.data
}

export async function createRootDocument(key, body) {
  const res = await rootApi.post(`/root/collections/${key}`, body)
  return res.data?.data
}

export async function updateRootDocument(key, id, body) {
  const res = await rootApi.put(`/root/collections/${key}/${id}`, body)
  return res.data?.data
}

export async function deleteRootDocument(key, id) {
  const res = await rootApi.delete(`/root/collections/${key}/${id}`)
  return res.data?.data
}

export async function wipeRootCollection(key) {
  const res = await rootApi.post(`/root/collections/${key}/wipe`)
  return res.data?.data
}

export default rootApi
