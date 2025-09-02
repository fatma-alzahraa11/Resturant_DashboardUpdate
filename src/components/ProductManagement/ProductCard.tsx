import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Info, Package, Image as ImageIcon, Trash2, CheckCircle, Sparkles, Star } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onShowIngredients: (ingredients: string) => void;
  categoryName?: string;
  onToggleAvailable?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  bgClass?: string; // كلاس الخلفية الممرر من ProductList
  isNewlyAdded?: boolean; // إضافة خاصية جديدة للمنتجات المضافة حديثاً
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onShowIngredients, 
  categoryName, 
  onToggleAvailable, 
  onDelete, 
  bgClass,
  isNewlyAdded = false 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [showSuccess, setShowSuccess] = useState(isNewlyAdded);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تأخير قصير لبدء الأنيميشن
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isNewlyAdded) {
      // إخفاء رسالة النجاح بعد 3 ثواني
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isNewlyAdded]);

  return (
    <div
      className={
        `bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300 group relative overflow-hidden flex flex-col ${isRTL ? 'rtl' : ''}`
      }
      style={{ minWidth: 280, maxWidth: 340 }}
    >
      {/* صورة المنتج */}
      {product.image && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {/* شارة NEW متطورة */}
          {product.isNew && (
            <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-20 animate-bounce flex items-center gap-1`}>
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xl border-2 border-white flex items-center gap-1 uppercase tracking-widest drop-shadow-lg animate-pulse">
                <Star className="w-3.5 h-3.5 text-white drop-shadow-sm mr-1" />
                NEW
              </span>
            </div>
          )}
        </div>
      )}
      {/* بيانات المنتج */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* الاسم والسعر */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xl text-orange-900 truncate flex-1 mr-3">{product.name}</h3>
          <span className="text-xl font-extrabold text-orange-600 drop-shadow-sm whitespace-nowrap">€{product.price.toFixed(2)}</span>
        </div>
        {/* التصنيف */}
        {categoryName && (
          <div className="mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-lg">{categoryName}</span>
          </div>
        )}
        {/* الوصف */}
        {product.description && (
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">{t('productManagement.description')}</div>
            <p className="text-gray-700 text-sm break-words">{product.description}</p>
          </div>
        )}
        {/* المكونات */}
        {product.ingredients && (
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">{'Ingredients'}</div>
            <p className="text-gray-700 text-sm break-words">{product.ingredients}</p>
          </div>
        )}
        {/* حالة التوفر */}
        <div className="mb-2 flex items-center gap-2">
          <span className={`text-xs font-semibold ${product.isAvailable ? 'text-green-700' : 'text-gray-400'}`}>{product.isAvailable ? t('productManagement.available') : t('productManagement.unavailable')}</span>
          <button
            className="relative w-10 h-6 rounded-full transition-all duration-300 shadow-inner focus:outline-none"
            style={{ background: product.isAvailable ? '#22c55e' : '#d1d5db' }}
            onClick={() => onToggleAvailable && onToggleAvailable(product)}
            title={product.isAvailable ? t('productManagement.available') : t('productManagement.unavailable')}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${product.isAvailable ? 'translate-x-4' : ''}`}
            />
          </button>
        </div>
        {/* أزرار التعديل والحذف */}
        <div className="flex items-center justify-between mt-4">
          <button
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => onEdit && onEdit(product)}
            title={t('common.edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
            onClick={() => onDelete && onDelete(product)}
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;