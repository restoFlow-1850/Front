// Mijozlar fikrlari va reytinglarini boshqarish API servisi
import api from '../../services/axios'

const LOCAL_STORAGE_KEY = 'restoflow_feedbacks_v2'

const DEFAULT_INITIAL_FEEDBACKS = [
  {
    _id: 'fb-101',
    customerName: 'Javohir Alimov',
    customerPhone: '+998 90 123 45 67',
    rating: 5,
    category: "Taom ta'mi",
    tableNumber: '4',
    comment: 'Osh juda mazali va yangi masaliqlardan tayyorlangan. Xizmat ko\'rsatish yuqori darajada.',
    status: 'reviewed',
    adminReply: 'Rahmat! Sizga xizmat ko\'rsatganimizdan mamnunmiz.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'fb-102',
    customerName: 'Malika Saidova',
    customerPhone: '+998 97 765 43 21',
    rating: 4,
    category: "Xizmat ko'rsatish",
    tableNumber: '12',
    comment: 'Musiqa va sharoitlar yaxshi, to\'lov vaqtida kassa navbati biroz cho\'zildi.',
    status: 'new',
    adminReply: '',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'fb-103',
    customerName: 'Sardor Rahimov',
    customerPhone: '+998 93 333 22 11',
    rating: 5,
    category: 'Atmosfera',
    tableNumber: '8',
    comment: 'Oilaviy tushlik uchun qulay maskan. Ichimlik va dessertlar sifati a\'lo.',
    status: 'new',
    adminReply: '',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
]

function getLocalFeedbacks() {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_FEEDBACKS
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_FEEDBACKS))
      return DEFAULT_INITIAL_FEEDBACKS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_INITIAL_FEEDBACKS
  }
}

function saveLocalFeedbacks(items) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.warn('[Feedback API] Local storage error:', err)
  }
}

export async function getFeedbacks(params = {}) {
  try {
    const response = await api.get('/feedbacks', { params })
    return response.data?.data?.feedbacks ?? response.data
  } catch {
    let items = getLocalFeedbacks()
    if (params.rating) {
      items = items.filter((f) => String(f.rating) === String(params.rating))
    }
    if (params.status) {
      items = items.filter((f) => f.status === params.status)
    }
    if (params.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (f) =>
          f.customerName?.toLowerCase().includes(q) ||
          f.comment?.toLowerCase().includes(q) ||
          String(f.tableNumber).includes(q),
      )
    }
    return items
  }
}

export async function createFeedback(data) {
  try {
    const response = await api.post('/feedbacks', data)
    return response.data?.data?.feedback ?? response.data
  } catch {
    const newFeedback = {
      _id: `fb-${Date.now()}`,
      customerName: data.customerName || 'Mehmon',
      customerPhone: data.customerPhone || '—',
      rating: Number(data.rating) || 5,
      category: data.category || "Taom ta'mi",
      tableNumber: data.tableNumber || '—',
      comment: data.comment || '',
      status: 'new',
      adminReply: '',
      createdAt: new Date().toISOString(),
    }
    const current = getLocalFeedbacks()
    const updated = [newFeedback, ...current]
    saveLocalFeedbacks(updated)
    return newFeedback
  }
}

export async function updateFeedbackStatus(id, { status, adminReply }) {
  try {
    const response = await api.patch(`/feedbacks/${id}`, { status, adminReply })
    return response.data?.data?.feedback ?? response.data
  } catch {
    const current = getLocalFeedbacks()
    const updated = current.map((item) => {
      if (item._id !== id) return item
      return {
        ...item,
        status: status ?? item.status,
        adminReply: adminReply !== undefined ? adminReply : item.adminReply,
      }
    })
    saveLocalFeedbacks(updated)
    return updated.find((item) => item._id === id)
  }
}

export async function deleteFeedback(id) {
  try {
    const response = await api.delete(`/feedbacks/${id}`)
    return response.data
  } catch {
    const current = getLocalFeedbacks()
    const updated = current.filter((item) => item._id !== id)
    saveLocalFeedbacks(updated)
    return { success: true }
  }
}

export async function getFeedbackStats() {
  const feedbacks = await getFeedbacks()
  const total = feedbacks.length
  if (total === 0) {
    return {
      total: 0,
      avgRating: 0,
      positivePercent: 0,
      attentionCount: 0,
      newCount: 0,
    }
  }

  const sumRating = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0)
  const avgRating = (sumRating / total).toFixed(1)
  const positiveCount = feedbacks.filter((f) => f.rating >= 4).length
  const positivePercent = Math.round((positiveCount / total) * 100)
  const attentionCount = feedbacks.filter((f) => f.rating <= 2).length
  const newCount = feedbacks.filter((f) => f.status === 'new').length

  return {
    total,
    avgRating: Number(avgRating),
    positivePercent,
    attentionCount,
    newCount,
  }
}
