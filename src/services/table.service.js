import api from './axios';

const DEMO_TOKEN = 'demo-token';

const sampleTables = [
  { id: 't1', number: 1, zone: 'A', status: 'available' },
  { id: 't2', number: 2, zone: 'A', status: 'occupied' },
  { id: 't3', number: 3, zone: 'A', status: 'reserved' },
  { id: 't4', number: 4, zone: 'B', status: 'available' },
  { id: 't5', number: 5, zone: 'B', status: 'cleaning' },
  { id: 't6', number: 6, zone: 'B', status: 'available' },
  { id: 't7', number: 7, zone: 'C', status: 'occupied' },
  { id: 't8', number: 8, zone: 'C', status: 'available' },
];

const isDemoMode = () => localStorage.getItem('accessToken') === DEMO_TOKEN;

export const tableService = {
  getAll: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: sampleTables });
    }
    return api.get('/tables');
  },
  getOne: (id) => {
    if (isDemoMode()) {
      const table = sampleTables.find((item) => item.id === id);
      return Promise.resolve({ data: table || null });
    }
    return api.get(`/tables/${id}`);
  },
  create: (data) => {
    if (isDemoMode()) {
      const newTable = { ...data, id: `t${Date.now()}` };
      return Promise.resolve({ data: newTable });
    }
    return api.post('/tables', data);
  },
  update: (id, data) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id, ...data } });
    }
    return api.put(`/tables/${id}`, data);
  },
  delete: (id) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id } });
    }
    return api.delete(`/tables/${id}`);
  },
  changeStatus: (id, status) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id, status } });
    }
    return api.patch(`/tables/${id}/status`, { status });
  },
};
