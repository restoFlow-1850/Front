import api from './axios';

const DEMO_TOKEN = 'demo-token';

const sampleReservations = [];

const isDemoMode = () => localStorage.getItem('accessToken') === DEMO_TOKEN;

export const reservationService = {
  getAll: (params = {}) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { reservations: sampleReservations, pagination: { page: 1, limit: sampleReservations.length, total: sampleReservations.length } } });
    }
    return api.get('/reservations', { params });
  },
  getOne: (id) => {
    if (isDemoMode()) {
      const reservation = sampleReservations.find((item) => item.id === id);
      return Promise.resolve({ data: reservation || null });
    }
    return api.get(`/reservations/${id}`);
  },
  create: (data) => {
    if (isDemoMode()) {
      const newReservation = { ...data, id: `res-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
      sampleReservations.unshift(newReservation);
      return Promise.resolve({ data: newReservation });
    }
    return api.post('/reservations', data);
  },
  update: (id, data) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id, ...data } });
    }
    return api.put(`/reservations/${id}`, data);
  },
  delete: (id) => {
    if (isDemoMode()) {
      const index = sampleReservations.findIndex((item) => item.id === id);
      if (index !== -1) sampleReservations.splice(index, 1);
      return Promise.resolve({ data: { id } });
    }
    return api.delete(`/reservations/${id}`);
  },
  changeStatus: (id, status) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id, status } });
    }
    return api.patch(`/reservations/${id}/status`, { status });
  },
};

// Backend javobi turli shaklda bo'lishi mumkin — shu funksiya ularni bitta formatga keltiradi.
export function normalizeReservationsPayload(payload) {
  if (Array.isArray(payload)) {
    return { reservations: payload, pagination: null };
  }
  const data = payload?.data ?? payload ?? {};
  const reservations = Array.isArray(data) ? data : data.reservations ?? data.items ?? [];
  const pagination = payload?.pagination ?? data.pagination ?? null;
  return { reservations, pagination };
}
