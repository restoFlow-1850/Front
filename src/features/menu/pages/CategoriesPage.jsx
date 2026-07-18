import { useState } from 'react';
import { useCategories } from '../../../hooks/useCategories';
import CategoryFormModal from '../components/CategoryFormModal';
import Button from '../../../components/ui/Button';
import { Plus, Pencil, Trash2, Tag } from '../../../lib/Icons';

const CategoriesPage = () => {
  const { categories, loading, error, addCategory, editCategory, removeCategory, refetch } = useCategories();
  const [modalState, setModalState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', category }

  const handleSubmit = async (data) => {
    const result =
      modalState?.mode === 'edit'
        ? await editCategory(modalState.category.id, data)
        : await addCategory(data);

    if (result.success) {
      setModalState(null);
    } else {
      alert("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`"${category.name}" kategoriyasini o'chirmoqchimisiz?`)) return;
    const result = await removeCategory(category.id);
    if (!result.success) alert("O'chirishda xatolik yuz berdi.");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kategoriyalar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Menyu kategoriyalarini boshqarish</p>
        </div>
        <Button onClick={() => setModalState({ mode: 'create' })} className="!w-auto">
          <Plus size={16} /> Yangi kategoriya
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-red-300 dark:border-red-900/50">
          <p className="text-red-500 mb-3">Kategoriyalarni yuklashda xatolik: {error}</p>
          <Button variant="secondary" className="!w-auto mx-auto" onClick={refetch}>
            Qayta urinish
          </Button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <Tag size={32} className="mx-auto mb-3 opacity-50" />
          <p>Hozircha kategoriyalar yo'q</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalState({ mode: 'edit', category })}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Tahrirlash"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  aria-label="O'chirish"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <CategoryFormModal
          category={modalState.mode === 'edit' ? modalState.category : null}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
