import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';

interface CategoryFormProps {
  onAddCategory: (name: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onAddCategory, onCancel, isVisible }) => {
  const { t, i18n } = useTranslation();
  const [categoryName, setCategoryName] = useState('');
  const isRTL = i18n.language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName.trim());
      setCategoryName('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-xl font-bold text-primary-900">
            {t('productManagement.addCategory')}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.categoryName')}
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={t('productManagement.categoryNamePlaceholder')}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              required
              autoFocus
            />
          </div>

          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              {t('common.add')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;