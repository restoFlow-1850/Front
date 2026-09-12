import api from '../../services/axios'

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

export const settingsApi = {
  get: async () => {
    const response = await api.get('/settings')
    return unwrap(response)
  },

  update: async ({ logoFile, ...values }) => {
    if (logoFile instanceof File) {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'printers') {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      formData.append('logo', logoFile)

      const response = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return unwrap(response)
    }

    const response = await api.put('/settings', values)
    return unwrap(response)
  },
}
