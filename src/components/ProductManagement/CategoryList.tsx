import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, Plus } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  categories: Category[];
  onEditCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddProduct: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEditCategory,
  onDeleteCategory,
  onAddProduct
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleEditSave = (id: string) => {
    if (editName.trim()) {
      onEditCategory(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('productManagement.noCategoriesYet')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow flex items-center justify-between gap-4">
            <div className={`flex items-center gap-3 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave(category.id);
                    } else if (e.key === 'Escape') {
                      handleEditCancel();
                    }
                  }}
                />
              ) : (
                <h3 className="text-xl font-bold text-primary-900">{category.name}</h3>
              )}
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => onAddProduct(category.id)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t('productManagement.addProduct')}
              </button>
              {editingId === category.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSave(category.id)}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStart(category)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isVisible={showDeleteDialog}
        title={t('productManagement.deleteCategoryTitle')}
        message={t('productManagement.confirmDeleteCategory')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </>
  );
};

export default CategoryList;