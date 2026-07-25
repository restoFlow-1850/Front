// Oshxona API so'rovlari.
// Backend: https://backend-production-11b7.up.railway.app (Railway, ishlab chiqarishda).
// Javob formati (ARCHITECTURE.md): { success, message, data, pagination }
//
// TODO (Ziyodulla): Swagger UI (/api-docs) ochilgach quyidagilarni tasdiqlash:
//  - Oshxona taxtasi uchun buyurtmalar ro'yxati manzili to'g'rimi? (`/kitchen/orders`
//    deb faraz qilingan — agar backendda boshqacha bo'lsa shu yerni almashtiring)
//  - Status yangilash manzili va usuli (`PATCH /orders/{id}/status`) to'g'rimi?
import api from '../../services/axios'

export async function fetchKitchenOrders() {
  const res = await api.get('/kitchen/orders')
  return res.data?.data ?? []
}

// Backend kontrakti: PATCH /orders/{id}/status  body: { "status": "yangi" }
export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/orders/${orderId}/status`, { status })
  return res.data?.data
}
