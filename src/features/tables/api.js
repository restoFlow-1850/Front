// Stollar backend so'rovlari — services/axios orqali.
// Manba: Abdurahmon (api/tablesApi.js), arxitekturaga moslashtirildi.
import api from '../../services/axios'

export const getTables = () => api.get('/tables')
export const getTableById = (id) => api.get(`/tables/${id}`)
export const createTable = (data) => api.post('/tables', data)
export const updateTable = (id, data) => api.put(`/tables/${id}`, data)
export const deleteTable = (id) => api.delete(`/tables/${id}`)
