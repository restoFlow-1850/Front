// order:ready socket eventida table ObjectId keladi ("Stol 5" emas) — uni raqamga
// aylantirish uchun stollar ro'yxati kerak. features/tables/api.js'dan to'g'ridan-to'g'ri
// import qilinmaydi (arxitektura qoidasi: feature'lar bir-biridan import qilmaydi),
// shu sabab bir xil endpoint shu yerda alohida chaqiriladi.
import api from '../../services/axios'

export const getTables = () => {
  const stub = localStorage.getItem('__testTablesStub') // TEMP: demo uchun, keyin olib tashlanadi
  if (stub) return Promise.resolve({ data: JSON.parse(stub) })
  return api.get('/tables')
}
