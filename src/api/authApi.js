import { api } from './axiosInstance'

export const registerRequest = (data) => api.post('/auth/register', data)
// data: { name, email, password, phone, role }

export const loginRequest = (data) => api.post('/auth/login', data)
// data: { email, password }
// response.data: { accessToken, refreshToken, ... }

export const refreshRequest = (refreshToken) =>
    api.post('/auth/refresh', { refreshToken })

export const meRequest = () => api.get('/auth/me')