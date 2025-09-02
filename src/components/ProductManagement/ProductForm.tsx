import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  ingredients: string;
  image?: string;
  isAvailable: boolean;
  isNew: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onCancel: () => void;
  isVisible: boolean;
  editingProduct?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  onAddProduct,
  onUpdateProduct,
  onCancel,
  isVisible,
  editingProduct
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    categoryId: editingProduct?.categoryId || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price || 0,
    ingredients: editingProduct?.ingredients || '',
    image: editingProduct?.image || '',
    isAvailable: editingProduct?.isAvailable ?? true,
    isNew: editingProduct?.isNew ?? false
  });

  const [imagePreview, setImagePreview] = useState<string>(editingProduct?.image || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync form when editingProduct changes (e.g., after fetching by ID)
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        categoryId: editingProduct.categoryId || '',
        description: editingProduct.description || '',
        price: editingProduct.price || 0,
        ingredients: editingProduct.ingredients || '',
        image: editingProduct.image || '',
        isAvailable: editingProduct.isAvailable ?? true,
        isNew: editingProduct.isNew ?? false
      });
      setImagePreview(editingProduct.image || '');
    }
  }, [editingProduct]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Require allergens (ingredients field maps to allergens array)
    const allergensInput = (formData.ingredients || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allergensInput.length === 0) {
      setFormError(
        t('productManagement.allergensRequired', { defaultValue: 'Please add allergens or ingredients before saving.' }) as string
      );
      return;
    }
    setFormError(null);
    if (editingProduct) {
      onUpdateProduct({ ...formData, id: editingProduct.id });
    } else {
      onAddProduct(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      price: 0,
      ingredients: '',
      image: '',
      isAvailable: true,
      isNew: false
    });
    setImagePreview('');
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-xl font-bold text-primary-900">
            {editingProduct ? t('productManagement.editProduct') : t('productManagement.addProduct')}
          </h3>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${isRTL ? 'flex-row-reverse text-right' : 'text-left'} bg-orange-50 border-orange-200`}>
              <div className="p-2 bg-orange-100 rounded-lg">
                <X className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-orange-800 font-medium">
                {formError}
              </div>
            </div>
          )}
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.productImage')}
            </label>
            <div className="flex items-start gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">{t('productManagement.uploadImage')}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors mb-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('productManagement.chooseFile')}
                </button>
                <p className="text-xs text-gray-500">
                  {t('productManagement.imageUploadHint')}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.productName')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('productManagement.productNamePlaceholder')}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.category')}
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              required
            >
              <option value="">{t('productManagement.selectCategory')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('productManagement.descriptionPlaceholder')}
              rows={3}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.price')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              value={formData.price === 0 ? '' : formData.price}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, '.');
                if (/^\d*(\.|,)?\d*$/.test(val)) {
                  setFormData(prev => ({ ...prev, price: val === '' ? 0 : parseFloat(val) }));
                }
              }}
              placeholder="€"
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productManagement.allergens')}
            </label>
            <input
              type="text"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder={t('productManagement.allergensPlaceholder')}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('productManagement.allergensHint')}
            </p>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-medium text-gray-700">
                {t('productManagement.availability')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-medium text-gray-700">
                {t('productManagement.markAsNew')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              {editingProduct ? t('common.update') : t('common.add')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
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

export default ProductForm;