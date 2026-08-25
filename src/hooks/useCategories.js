import { useCallback, useEffect, useState } from 'react';
import { categoryService, normalizeCategoriesPayload } from '../services/category.service';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAll();
      setCategories(normalizeCategoriesPayload(response.data));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Kategoriyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (data) => {
    try {
      const response = await categoryService.create(data);
      setCategories((prev) => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const editCategory = async (id, data) => {
    try {
      const response = await categoryService.update(id, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...response.data } : c)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const removeCategory = async (id) => {
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { categories, loading, error, addCategory, editCategory, removeCategory, refetch: fetchCategories };
};
