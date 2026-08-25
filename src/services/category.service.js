import api from './axios';

const DEMO_TOKEN = 'demo-token';

const sampleCategories = [
  { id: 'c1', name: 'Ichimliklar' },
  { id: 'c2', name: 'Issiq taomlar' },
  { id: 'c3', name: 'Salatlar' },
];

const isDemoMode = () => localStorage.getItem('accessToken') === DEMO_TOKEN;

export const categoryService = {
  getAll: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { categories: sampleCategories } });
    }
    return api.get('/categories');
  },
  create: (data) => {
    if (isDemoMode()) {
      const newCategory = { ...data, id: `c${Date.now()}` };
      sampleCategories.push(newCategory);
      return Promise.resolve({ data: newCategory });
    }
    return api.post('/categories', data);
  },
  update: (id, data) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { id, ...data } });
    }
    return api.put(`/categories/${id}`, data);
  },
  delete: (id) => {
    if (isDemoMode()) {
      const index = sampleCategories.findIndex((item) => item.id === id);
      if (index !== -1) sampleCategories.splice(index, 1);
      return Promise.resolve({ data: { id } });
    }
    return api.delete(`/categories/${id}`);
  },
};

// Backend `{ data: { categories: [...] } }` yoki `{ data: [...] }` shaklida qaytarishi mumkin.
export function normalizeCategoriesPayload(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.categories ?? payload?.data?.categories ?? payload?.data ?? [];
}
