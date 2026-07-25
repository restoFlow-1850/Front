// Buyurtmalar API so'rovlari.
// Backend: https://backend-production-11b7.up.railway.app
// TODO: Swagger UI'da POST /orders manzili va javob shakli tasdiqlansin.
import api from '../../services/axios'

// Backend kontrakti (foydalanuvchi tomonidan berilgan):
// body: { table: string, items: [{ product: string, quantity: number }], notes: string }
export async function createOrder({ table, items, notes }) {
  const res = await api.post('/orders', { table, items, notes })
  return res.data?.data
}
