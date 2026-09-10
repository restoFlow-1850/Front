// Mijozlar fikrlari va reytinglarini backend API orqali boshqarish.
// Fikr lokal saqlanmaydi: API xatosi mijozga ko'rinishi kerak, aks holda
// yuborilmagan fikr "yuborildi" deb noto'g'ri ko'rinadi.
import api from '../../services/axios'

export async function getFeedbacks(params = {}) {
  const response = await api.get('/feedbacks', { params })
  return response.data?.data?.feedbacks ?? response.data
}

export async function createFeedback(data) {
  const response = await api.post('/feedbacks', data)
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
  const feedbacks = await getFeedbacks()
  const total = feedbacks.length
  if (total === 0) {
    return { total: 0, avgRating: 0, positivePercent: 0, attentionCount: 0, newCount: 0 }
  }

  const sumRating = feedbacks.reduce((acc, feedback) => acc + (feedback.rating || 0), 0)
  const avgRating = (sumRating / total).toFixed(1)
  const positiveCount = feedbacks.filter((feedback) => feedback.rating >= 4).length
  const attentionCount = feedbacks.filter((feedback) => feedback.rating <= 2).length

  return {
    total,
    avgRating: Number(avgRating),
    positivePercent: Math.round((positiveCount / total) * 100),
    attentionCount,
    newCount: feedbacks.filter((feedback) => feedback.status === 'new').length,
  }
}
