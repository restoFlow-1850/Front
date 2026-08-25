import api from '../../services/axios'

export const getUsers = ({ page = 1, limit = 20 } = {}) =>
    api.get('/users', { params: { page, limit } })

export const getUserById = (id) => api.get(`/users/${id}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)