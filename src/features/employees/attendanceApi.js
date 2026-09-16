import api from '../../services/axios'

export const getAttendance = ({ page = 1, limit = 20 } = {}) =>
    api.get('/attendance', { params: { page, limit } })

export const getAttendanceById = (id) => api.get(`/attendance/${id}`)
export const createAttendance = (data) => api.post('/attendance', data)
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data)
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`)             