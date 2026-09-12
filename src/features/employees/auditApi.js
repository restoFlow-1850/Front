import api from '../../services/axios'

export const getAuditLogs = ({ page = 1, limit = 20, user, action, entity, startDate, endDate } = {}) =>
    api.get('/audit', { params: { page, limit, user, action, entity, startDate, endDate } })

export const getAuditLogById = (id) => api.get(`/audit/${id}`)