// Mijozlar fikrlari va reytinglarini backend API (/api/feedbacks) orqali boshqarish.
// Fikr lokal saqlanmaydi: API xatosi foydalanuvchiga ko'rinishi kerak, aks holda
// yuborilmagan fikr "yuborildi" deb noto'g'ri ko'rinadi.
import api from '../../services/axios'

export async function getFeedbacks(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const response = await api.get('/feedbacks', { params: cleanParams })
  const list = response.data?.data?.feedbacks ?? response.data?.feedbacks ?? response.data
  return Array.isArray(list) ? list : []
}

// Mehmon (loginsiz) fikr qoldirganda restoran ?restaurant= orqali aniqlanadi
export async function createFeedback(data, restaurantId = null) {
  const config = restaurantId ? { params: { restaurant: restaurantId } } : undefined
  const response = await api.post('/feedbacks', data, config)
  return response.data?.data?.feedback ?? response.data
}

export async function updateFeedbackStatus(id, { status, adminReply }) {
  const response = await api.patch(`/feedbacks/${id}`, { status, adminReply })
  return response.data?.data?.feedback ?? response.data
}

export async function deleteFeedback(id) {
  const response = await api.delete(`/feedbacks/${id}`)
  return response.data
}

export async function getFeedbackStats() {
  const response = await api.get('/feedbacks/stats')
  const raw = response.data?.data?.stats ?? response.data?.data ?? response.data ?? {}
  return {
    total: Number(raw.total) || 0,
    avgRating: Number(raw.avgRating) || 0,
    positivePercent: Number(raw.positivePercent) || 0,
    attentionCount: Number(raw.attentionCount) || 0,
    newCount: Number(raw.newCount) || 0,
  }
}
